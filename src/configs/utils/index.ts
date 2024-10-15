import { tags } from 'typia';

export const buildPaginationParams = (page: {
  page?: number & tags.Type<'uint32'>;
  limit?: number & tags.Type<'uint32'>;
}) => {
  const limit = page.limit || 10;
  const pageNo = page.page || 1;
  return {
    take: limit,
    skip: limit * (pageNo - 1),
  };
};
