
import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function History() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await api.get("history/");
        setRecords(response.history || []);
      } catch (err) {
        setError(
          err.response?.data?.error ||
            "Unable to load prediction history. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
      <p className="text-sm font-medium text-green-700">
        Crop Digital Twin
      </p>

      <h1 className="mt-2 text-2xl font-bold text-gray-900">
        Prediction History
      </h1>

      <p className="mt-2 text-gray-500">
        Review your previously generated crop-health predictions.
      </p>

      {loading && (
        <p className="mt-6 text-gray-600">Loading history...</p>
      )}

      {error && (
        <p className="mt-6 text-red-600">{error}</p>
      )}

      {!loading && !error && records.length === 0 && (
        <p className="mt-6 rounded-lg bg-gray-50 p-4 text-gray-600">
          No prediction history yet. Submit a prediction to see it here.
        </p>
      )}

      {!loading && !error && records.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[650px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="p-3 text-sm font-semibold">Crop</th>
                <th className="p-3 text-sm font-semibold">Crop Health</th>
                <th className="p-3 text-sm font-semibold">Soil pH</th>
                <th className="p-3 text-sm font-semibold">Moisture (%)</th>
                <th className="p-3 text-sm font-semibold">Temperature</th>
                <th className="p-3 text-sm font-semibold">Date & Time</th>
              </tr>
            </thead>

            <tbody>
              {records.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-gray-100 hover:bg-green-50"
                >
                  <td className="p-3">{record.crop_type}</td>
                  <td className="p-3 font-medium text-green-700">
                    {record.crop_health}
                  </td>
                  <td className="p-3">{record.soil_ph}</td>
                  <td className="p-3">{record.soil_moisture}</td>
                  <td className="p-3">{record.temperature} °C</td>
                  <td className="p-3 text-sm text-gray-600">
                    {new Date(record.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
