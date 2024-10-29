export class CreateBuyOrderDto {
  productId!: number; // Non-null assertion
  quantity!: number;
  price!: number;
  userId!: string;
}
