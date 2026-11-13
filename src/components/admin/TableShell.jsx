import React from "react";

const TableShell = ({ columns, children, empty, loading, colCount }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="admin-table w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`admin-th ${col.className || ""}`}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={colCount || columns.length} className="py-14 text-center">
                  <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />
                </td>
              </tr>
            ) : empty ? (
              <tr>
                <td
                  colSpan={colCount || columns.length}
                  className="py-14 text-center text-sm text-slate-500"
                >
                  {empty}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableShell;
