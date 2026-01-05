import API from "../services/api";

export default function Reports() {
  const currentDate = new Date();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  /* MONTHLY CSV */
  const downloadMonthlyCSV = () => {
    window.open(
      `${API.defaults.baseURL}/reports/export/monthly/csv?month=${month}&year=${year}`,
      "_blank"
    );
  };

  /* YEARLY EXCEL */
  const downloadYearlyExcel = () => {
    window.open(
      `${API.defaults.baseURL}/reports/export/yearly/excel?year=${year}`,
      "_blank"
    );
  };

  return (
    <div>
      <h2>Reports</h2>
      <p>Monthly / Yearly / Vendor / Customer reports will appear here.</p>

      <h3>Quick Exports</h3>

      <button onClick={downloadMonthlyCSV}>
        Export Monthly Report (CSV)
      </button>

      <button
        onClick={downloadYearlyExcel}
        style={{ marginLeft: 10 }}
      >
        Export Yearly Report (Excel)
      </button>
    </div>
  );
}
