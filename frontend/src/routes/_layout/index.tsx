import {
  Box,
  Container,
  Text,
  Flex,
  HStack,
  VStack,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import useAuth from "@/hooks/useAuth";
import { ProductsService } from "@/client";

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
});

function Dashboard() {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    ordersToday: 0,
    pendingShipments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const productsResp = await ProductsService.readProducts();
        const totalProducts = productsResp?.length || 0;

        // Replace these with your actual APIs
        const ordersToday = 24;
        const pendingShipments = 12;

        setStats({ totalProducts, ordersToday, pendingShipments });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) return <Spinner size="xl" />;

  return (
    <Container maxW="full" px={8} py={6}>
      <Flex align="center" justify="space-between" mb={8}>
        <HStack>
          <VStack align="start">
            <Text fontSize="2xl" fontWeight="bold">
              Hi, {currentUser?.full_name || currentUser?.email || "there"} 👋
            </Text>
            <Text fontSize="md" color="gray.500">
              Welcome back, nice to see you again!
            </Text>
          </VStack>
        </HStack>
        <Badge colorScheme="green" fontSize="0.9em">
          Active
        </Badge>
      </Flex>

      <Flex gap={6} wrap="wrap">
        <StatCard
          label="Total Products"
          value={stats.totalProducts.toString()}
        />
        <StatCard label="Orders Today" value={stats.ordersToday.toString()} />
        <StatCard
          label="Pending Shipments"
          value={stats.pendingShipments.toString()}
        />
      </Flex>
    </Container>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Box bg="white" shadow="md" borderRadius="lg" p={6} flex="1" minW="250px">
      <Text fontSize="sm" color="green.500">
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight="bold" color="green.500">
        {value}
      </Text>
    </Box>
  );
}
