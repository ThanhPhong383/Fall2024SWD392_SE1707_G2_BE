export class CreateBuyOrderDto {
  productId!: string; // Non-null assertion
  quantity!: number;
  price!: number;
  userId!: string;
}
