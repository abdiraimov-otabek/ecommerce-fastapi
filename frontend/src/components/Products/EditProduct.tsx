import {
  Button,
  ButtonGroup,
  DialogActionTrigger,
  Input,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { FaEdit } from "react-icons/fa";
import {
  type ApiError,
  type ProductRead,
  ProductsService,
  CategoriesService,
} from "@/client";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Field } from "../ui/field";

interface EditProductProps {
  product: ProductRead;
}

interface ProductUpdateForm {
  name: string;
  description?: string | null;
  sku: string;
  price: number;
  quantity: number;
  in_stock: boolean;
  image_url?: string | null;
  is_active: boolean;
  category_id: string;
}

const EditProduct = ({ product }: EditProductProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    product.category_id || "",
  );
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductUpdateForm>({
    mode: "onBlur",
    defaultValues: {
      name: product.name,
      description: product.description ?? "",
      sku: product.sku ?? "",
      price: Number(product.price),
      quantity: product.quantity,
      in_stock: product.in_stock ?? true,
      image_url: product.image_url ?? "",
      is_active: product.is_active ?? true,
      category_id: product.category_id || "",
    },
  });

  // Fetch categories for the dropdown
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => CategoriesService.readCategories({ skip: 0, limit: 1000 }),
  });

  const mutation = useMutation({
    mutationFn: (data: ProductUpdateForm) =>
      ProductsService.updateProduct({
        id: product.id,
        requestBody: data,
      }),
    onSuccess: () => {
      showSuccessToast("Product updated successfully.");
      reset();
      setIsOpen(false);
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const onSubmit: SubmitHandler<ProductUpdateForm> = (data) => {
    mutation.mutate({
      ...data,
      category_id: selectedCategoryId,
    });
  };

  const hasCategories =
    categories && categories.data && categories.data.length > 0;

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button variant="ghost">
          <FaEdit fontSize="16px" />
          Edit Product
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Update the product details below.</Text>
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
            <ButtonGroup>
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
                loading={isSubmitting}
                disabled={!selectedCategoryId || isSubmitting}
              >
                Save
              </Button>
            </ButtonGroup>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default EditProduct;
