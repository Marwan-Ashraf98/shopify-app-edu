import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams, useNavigation, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  IndexTable,
  useIndexResourceState,
  Text,
  Badge,
  IndexFilters,
  useSetIndexFiltersMode,
  ChoiceList,
  type IndexFiltersProps,
  IndexTableProps,
} from "@shopify/polaris";
import { useCallback, useState } from "react";
import db from "../db.server";

type IndexTableSortDirection = 'ascending' | 'descending';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const query = searchParams.get("query") || "";
  const sortKey = searchParams.get("sortKey") || "id";
  const direction = searchParams.get("direction")?.startsWith("desc") ? "desc" : "asc";

  const fuelTypeString = searchParams.get("fuelType");
  const fuelTypes = fuelTypeString ? fuelTypeString.split(",") : [];

  const where: any = {};
  if (query) {
    where.OR = [
      { brand: { contains: query } },
      { licensePlate: { contains: query } },
      { driverName: { contains: query } },
    ];
  }

  if (fuelTypes.length > 0) {
    where.fuelType = { name: { in: fuelTypes } };
  }

  const cars = await db.car.findMany({
    where,
    include: { fuelType: true },
    orderBy: { [sortKey]: direction },
  });

  return json({ cars });
};

export default function CarsPage() {
  const { cars } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const submit = useSubmit();
  const { mode, setMode } = useSetIndexFiltersMode();
  const navigation = useNavigation();

  const { 
    selectedResources, 
  } = useIndexResourceState(cars as any);

  const isLoading = navigation.state === "loading";

  const sortKey = searchParams.get("sortKey") || "id";
  const direction = (searchParams.get("direction") || "asc") as "asc" | "desc";
  const appliedFuelTypes = searchParams.get("fuelType")?.split(",") || [];
  const queryParam = searchParams.get("query") || "";

  const [queryValue, setQueryValue] = useState(queryParam);

  const headings = [
    { title: "ID", id: "id" },
    { title: "Brand", id: "brand" },
    { title: "License Plate", id: "licensePlate" },
    { title: "Year", id: "year" },
    { title: "Driver name", id: "driverName" },
    { title: "Fuel type", id: "fuelType" },
  ];

  const updateParams = (newParams: Record<string, string>) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) nextParams.set(key, value);
      else nextParams.delete(key);
    });
    setSearchParams(nextParams);
  };

  const mapPolarisDirToDb = (dir: IndexTableSortDirection): "asc" | "desc" => 
    dir === "ascending" ? "asc" : "desc";

  const mapDbDirToPolaris = (dir: "asc" | "desc"): IndexTableSortDirection => 
    dir === "asc" ? "ascending" : "descending";

  const handleTableSort = (headingIndex: number, dir: IndexTableSortDirection) => {
    const columnId = headings[headingIndex].id;
    updateParams({ sortKey: columnId, direction: mapPolarisDirToDb(dir) });
  };

  const handleFilterSort = (value: string[]) => {
    if (value.length > 0) {
      const [newSortKey, newDirection] = value[0].split(" ");
      updateParams({ sortKey: newSortKey, direction: newDirection });
    }
  };

  const handleQueryChange = useCallback((value: string) => {
    setQueryValue(value);
    
    const formData = new FormData();
    formData.set("query", value);
    // Persist other filters
    if (sortKey) formData.set("sortKey", sortKey);
    if (direction) formData.set("direction", direction);
    if (appliedFuelTypes.length) formData.set("fuelType", appliedFuelTypes.join(","));
    
    // Debounce the request by 300ms
    const timer = setTimeout(() => {
       submit(formData, { replace: true, method: "get" });
    }, 300);
    
    return () => clearTimeout(timer);
  }, [sortKey, direction, appliedFuelTypes, submit]);
  const handleFuelFilterChange = (v: string[]) => updateParams({ fuelType: v.join(",") });

  const sortOptions: IndexFiltersProps["sortOptions"] = [
    { label: "ID", value: "id asc", directionLabel: "Ascending" },
    { label: "ID", value: "id desc", directionLabel: "Descending" },
    { label: "Brand", value: "brand asc", directionLabel: "A-Z" },
    { label: "Brand", value: "brand desc", directionLabel: "Z-A" },
    { label: "Year", value: "year asc", directionLabel: "Oldest first" },
    { label: "Year", value: "year desc", directionLabel: "Newest first" },
  ];

  const filters = [
    {
      key: "fuelType",
      label: "Fuel type",
      filter: (
        <ChoiceList
          title="Fuel type"
          choices={[
            { label: "Diesel", value: "Diesel" },
            { label: "Petrol", value: "Petrol" },
            { label: "Electric", value: "Electric" },
          ]}
          selected={appliedFuelTypes}
          onChange={handleFuelFilterChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
  ];

  const rowMarkup = cars.map(
    ({ id, brand, licensePlate, year, driverName, fuelType }, index) => (
      <IndexTable.Row
        id={id.toString()}
        key={id}
        selected={selectedResources.includes(id.toString())}
        position={index}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">{id}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{brand}</IndexTable.Cell>
        <IndexTable.Cell>
          <Badge tone="info">{licensePlate}</Badge>
        </IndexTable.Cell>
        <IndexTable.Cell>{year}</IndexTable.Cell>
        <IndexTable.Cell>{driverName || "—"}</IndexTable.Cell>
        <IndexTable.Cell>
          <Badge tone={fuelType.name === "Electric" ? "success" : "new"}>
            {fuelType.name}
          </Badge>
        </IndexTable.Cell>
      </IndexTable.Row>
    )
  );

  return (
    <Page title="Cars" fullWidth>
      <Layout>
        <Layout.Section>
          <Card padding="0">
            <IndexFilters
              sortOptions={sortOptions}
              sortSelected={[`${sortKey} ${direction}`]}
              queryValue={queryValue}
              onQueryChange={handleQueryChange}
              onQueryClear={() => updateParams({ query: "" })}
              onSort={handleFilterSort}
              filters={filters}
              appliedFilters={appliedFuelTypes.length > 0 ? [{
                key: "fuelType",
                label: `Fuel: ${appliedFuelTypes.join(", ")}`,
                onRemove: () => handleFuelFilterChange([]),
              }] : []}
              onClearAll={() => updateParams({ query: "", fuelType: "" })}
              mode={mode}
              setMode={setMode}
              tabs={[]}
              selected={0}
              onSelect={() => {}}
              loading={isLoading}
            />
            <IndexTable
              resourceName={{ singular: "car", plural: "cars" }}
              itemCount={cars.length}
              headings={headings.map(h => ({ title: h.title })) as IndexTableProps['headings']}
              sortable={[true, true, false, true, false, false]}
              sortColumnIndex={headings.findIndex((h) => h.id === sortKey)}
              sortDirection={mapDbDirToPolaris(direction)}
              onSort={handleTableSort}
            >
              {rowMarkup}
            </IndexTable>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}