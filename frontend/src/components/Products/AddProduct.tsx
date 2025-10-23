import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Input,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { FaPlus } from "react-icons/fa";
import {
  type ProductCreate,
  ProductsService,
  CategoriesService,
} from "@/client";
import type { ApiError } from "@/client/core/ApiError";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "../ui/dialog";
import { Field } from "../ui/field";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "../ui/select";

const AddProduct = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      price: 0,
      quantity: 0,
      in_stock: true,
      image_url: "",
      is_active: true,
    },
  });

  // Fetch categories for the dropdown
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => CategoriesService.readCategories({ skip: 0, limit: 1000 }),
  });

  const mutation = useMutation({
    mutationFn: (data: ProductCreate) =>
      ProductsService.createProduct({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Product created successfully.");
      reset();
      setSelectedCategoryId("");
      setIsOpen(false);
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const onSubmit: SubmitHandler<ProductCreate> = (data) => {
    if (!selectedCategoryId) {
      return;
    }
    mutation.mutate({
      ...data,
      category_id: selectedCategoryId,
    });
  };

  const hasCategories =
    categories && categories.data && categories.data.length > 0;
  const isValid = selectedCategoryId !== "";

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => {
        setIsOpen(open);
        if (!open) {
          reset();
          setSelectedCategoryId("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button value="add-product" my={4}>
          <FaPlus fontSize="16px" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Fill in the details to add a new product.</Text>
            {!hasCategories && !categoriesLoading && (
              <Text color="red.500" mb={4}>
                Please create at least one category before adding products.
              </Text>
            )}
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.name}
                errorText={errors.name?.message}
                label="Name"
              >
                <Input
                  {...register("name", { required: "Name is required." })}
                  placeholder="Product name"
                  type="text"
                />
              </Field>

              <Field
                invalid={!!errors.description}
                errorText={errors.description?.message}
                label="Description"
              >
                <Textarea
                  {...register("description")}
                  placeholder="Product description"
                  rows={3}
                />
              </Field>

              <Field
                required
                invalid={!!errors.sku}
                errorText={errors.sku?.message}
                label="SKU"
              >
                <Input
                  {...register("sku", { required: "SKU is required." })}
                  placeholder="Product SKU"
                  type="text"
                />
              </Field>

              <Field
                required
                invalid={!!errors.price}
                errorText={errors.price?.message}
                label="Price"
              >
                <Input
                  {...register("price", {
                    required: "Price is required.",
                    valueAsNumber: true,
                    min: { value: 0, message: "Price must be positive." },
                  })}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                />
              </Field>

              <Field
                required
                invalid={!!errors.quantity}
                errorText={errors.quantity?.message}
                label="Quantity"
              >
                <Input
                  {...register("quantity", {
                    required: "Quantity is required.",
                    valueAsNumber: true,
                    min: {
                      value: 0,
                      message: "Quantity must be non-negative.",
                    },
                  })}
                  placeholder="0"
                  type="number"
                />
              </Field>

              <Field
                invalid={!!errors.image_url}
                errorText={errors.image_url?.message}
                label="Image URL"
              >
                <Input
                  {...register("image_url")}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                />
              </Field>

              <Field
                required
                invalid={!selectedCategoryId}
                errorText={
                  !selectedCategoryId ? "Category is required" : undefined
                }
                label="Category"
              >
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  disabled={!hasCategories}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "0.375rem",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <option value="">
                    {categoriesLoading
                      ? "Loading categories..."
                      : !hasCategories
                        ? "No categories available"
                        : "Select a category"}
                  </option>
                  {categories?.data.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>
            </VStack>
          </DialogBody>
          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button
                variant="subtle"
                colorPalette="gray"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button
              variant="solid"
              type="submit"
              disabled={!isValid || !hasCategories || isSubmitting}
              loading={isSubmitting}
            >
              Save
            </Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default AddProduct;
