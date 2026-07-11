const Table = ({ data, columns }) => {
    return (
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            {columns.map((col, index) => (
              <th key={index} className="border border-gray-300 px-4 py-2">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="text-center">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="border border-gray-300 px-4 py-2">
                  {row[col.toLowerCase()]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  
  export default Table;
  