import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-navy-800/50 border border-navy-700 rounded-lg mt-4 w-full">
      <div className="text-sm text-gainsboro-400">
        Showing <span className="font-medium text-gainsboro-200">{(meta.page - 1) * meta.limit + 1}</span> to <span className="font-medium text-gainsboro-200">{Math.min(meta.page * meta.limit, meta.total)}</span> of <span className="font-medium text-gainsboro-200">{meta.total}</span> results
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(meta.page - 1)}
          disabled={!meta.hasPrevPage}
          className="p-1 rounded-md text-gainsboro-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-navy-700 transition"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => onPageChange(meta.page + 1)}
          disabled={!meta.hasNextPage}
          className="p-1 rounded-md text-gainsboro-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-navy-700 transition"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
