import {
  Button,
  ButtonGroup,
  DialogActionTrigger,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { FaEdit } from "react-icons/fa";

import {
  type ApiError,
  type CategoryPublic,
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

interface EditCategoryProps {
  category: CategoryPublic;
}

interface CategoryUpdateForm {
  name: string;
  parent_id?: string | null;
}

const EditCategory = ({ category }: EditCategoryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryUpdateForm>({
    mode: "onBlur",
    defaultValues: {
      name: category.name,
      parent_id: category.parent_id ?? undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CategoryUpdateForm) =>
      CategoriesService.updateCategory({
        id: category.id,
        requestBody: data,
      }),
    onSuccess: () => {
      showSuccessToast("Category updated successfully.");
      reset();
      setIsOpen(false);
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const onSubmit: SubmitHandler<CategoryUpdateForm> = (data) => {
    mutation.mutate(data);
  };

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
          Edit Category
        </Button>
      </DialogTrigger>

      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>

          <DialogBody>
            <Text mb={4}>Update the category details below.</Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.name}
                errorText={errors.name?.message}
                label="Name"
              >
                <Input
                  {...register("name", { required: "Name is required" })}
                  placeholder="Category name"
                  type="text"
                />
              </Field>

              <Field
                invalid={!!errors.parent_id}
                errorText={errors.parent_id?.message}
                label="Parent ID (optional)"
              >
                <Input
                  {...register("parent_id")}
                  placeholder="Parent category ID"
                  type="text"
                />
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
              <Button variant="solid" type="submit" loading={isSubmitting}>
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

export default EditCategory;
