import type { ProductRead } from "@/client"; // Changed from ProductPublic
import DeleteProduct from "../Products/DeleteProduct";
import EditProduct from "../Products/EditProduct";
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu";
import { IconButton } from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";

interface ProductActionsMenuProps {
  product: ProductRead; // Changed from ProductPublic
}

export const ProductActionsMenu = ({ product }: ProductActionsMenuProps) => {
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton variant="ghost" color="inherit" aria-label="Menu">
          <BsThreeDotsVertical />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <EditProduct product={product} />
        <DeleteProduct id={product.id} />
      </MenuContent>
    </MenuRoot>
  );
};
