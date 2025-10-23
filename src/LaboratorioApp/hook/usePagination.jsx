// hooks/usePagination.js
import { useState, useCallback } from 'react';

export const usePagination = (pageSize = 10) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const goToPage = useCallback((page, loadData) => {
        if (page >= 0 && page < totalPages) {
            loadData(page);
        }
    }, [totalPages]);

    const nextPage = useCallback((loadData) => {
        goToPage(currentPage + 1, loadData);
    }, [currentPage, goToPage]);

    const prevPage = useCallback((loadData) => {
        goToPage(currentPage - 1, loadData);
    }, [currentPage, goToPage]);

    return {
        currentPage,
        setCurrentPage,
        pageSize,
        totalElements,
        setTotalElements,
        totalPages,
        setTotalPages,
        goToPage,
        nextPage,
        prevPage,
        hasNextPage: currentPage < totalPages - 1,
        hasPrevPage: currentPage > 0
    };
};
