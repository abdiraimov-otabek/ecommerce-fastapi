import {
  Container,
  EmptyState,
  Flex,
  Heading,
  Table,
  VStack,
  Badge,
  Image,
  Box,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FiSearch } from "react-icons/fi";
import { z } from "zod";

import { ProductsService } from "@/client";
import { ProductActionsMenu } from "@/components/Common/ProductActionsMenu";
import AddProduct from "@/components/Products/AddProduct";
import PendingItems from "@/components/Pending/PendingItems";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination.tsx";

const productsSearchSchema = z.object({
  page: z.number().catch(1),
});

const PER_PAGE = 10;

function getProductsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      ProductsService.readProducts({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
      }),
    queryKey: ["products", { page }],
  };
}

export const Route = createFileRoute("/_layout/products")({
  component: ProductsLayout,
  validateSearch: (search) => productsSearchSchema.parse(search),
});

function ProductsTable() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { page } = Route.useSearch();

  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getProductsQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  });

  const setPage = (page: number) => {
    navigate({
      to: "/products",
      search: (prev) => ({ page }),
    });
  };

  const products = data?.data?.slice(0, PER_PAGE) ?? [];
  const count = data?.count ?? 0;

  if (isLoading) {
    return <PendingItems />;
  }

  if (products.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <FiSearch />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>No products yet</EmptyState.Title>
            <EmptyState.Description>
              Add a new product to get started
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  return (
    <>
      <Table.Root size={{ base: "sm", md: "md" }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader w="xs">Image</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Name</Table.ColumnHeader>
            <Table.ColumnHeader w="xs">SKU</Table.ColumnHeader>
            <Table.ColumnHeader w="xs">Price</Table.ColumnHeader>
            <Table.ColumnHeader w="xs">Quantity</Table.ColumnHeader>
            <Table.ColumnHeader w="xs">Status</Table.ColumnHeader>
            <Table.ColumnHeader w="xs">Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {products.map((product) => (
            <Table.Row key={product.id} opacity={isPlaceholderData ? 0.5 : 1}>
              <Table.Cell>
                <Box w="50px" h="50px" overflow="hidden" borderRadius="md">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      objectFit="cover"
                      w="full"
                      h="full"
                    />
                  ) : (
                    <Box
                      w="full"
                      h="full"
                      bg="gray.200"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="xs"
                      color="gray.500"
                    >
                      No image
                    </Box>
                  )}
                </Box>
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {product.name}
              </Table.Cell>
              <Table.Cell truncate maxW="xs">
                {product.sku}
              </Table.Cell>
              <Table.Cell>${Number(product.price).toFixed(2)}</Table.Cell>
              <Table.Cell>{product.quantity}</Table.Cell>
              <Table.Cell>
                <Flex gap={2} flexWrap="wrap">
                  <Badge
                    colorPalette={product.in_stock ? "green" : "red"}
                    size="sm"
                  >
                    {product.in_stock ? "In Stock" : "Out of Stock"}
                  </Badge>
                  {product.is_active && (
                    <Badge colorPalette="blue" size="sm">
                      Active
                    </Badge>
                  )}
                </Flex>
              </Table.Cell>
              <Table.Cell>
                <ProductActionsMenu product={product} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <Flex justifyContent="flex-end" mt={4}>
        <PaginationRoot
          count={count}
          pageSize={PER_PAGE}
          onPageChange={({ page }) => setPage(page)}
        >
          <Flex>
            <PaginationPrevTrigger />
            <PaginationItems />
            <PaginationNextTrigger />
          </Flex>
        </PaginationRoot>
      </Flex>
    </>
  );
}

function ProductsLayout() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Products Management
      </Heading>
      <AddProduct />
      <ProductsTable />
    </Container>
  );
}
