import { Pagination } from 'src/interfaces/pagination';
import { PaginationPages } from 'src/interfaces/pagination-page';

export function getPaginationPages(
  pagesCount: number,
  pageNumber: number,
): PaginationPages {
  if (pagesCount < 2) return [];

  const pages: PaginationPages = [];

  if (pagesCount <= 3) {
    for (let i = 1; i <= pagesCount; i++) {
      pages.push({
        pageNumber: i,
        activePage: i === pageNumber,
      });
    }
  } else {
    let i: number;
    let stop: number;

    if (pageNumber === 1) {
      i = 1;
      stop = 3;
    } else if (pageNumber === pagesCount) {
      i = pageNumber - 2;
      stop = pagesCount;
    } else {
      i = pageNumber - 1;
      stop = pageNumber + 1;
    }

    for (i; i <= stop; i++) {
      pages.push({
        pageNumber: i,
        activePage: i === pageNumber,
      });
    }
  }
  return pages;
}

export function getPagination(
  pagesCount: number,
  pageNumber: number,
): Pagination {
  if (pagesCount < 2) {
    return {};
  } else {
    return {
      prev: pageNumber > 1 ? pageNumber - 1 : 1,
      next: pageNumber < pagesCount ? pageNumber + 1 : pagesCount,
      first: 1,
      last: pagesCount,
    };
  }
}
