"use client";

import { useSelector } from " +/redux";

const Economy = () => {
  const economy = useSelector((s) => s.property.economy);

  if (!economy) {
    return <div className="p-6 text-center text-gray-500">No economy data available.</div>;
  }

  const { annualBudget, accumulatedCosts, costDistribution, transactions } = economy;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8">Beratung Economy</h1>

      {/* Overview Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Annual Overview</h2>
        <p className="text-lg">
          <span className="font-medium">Annual Budget:</span> ${annualBudget.toFixed(2)}
        </p>
        <p className="text-lg">
          <span className="font-medium">Accumulated Costs:</span> ${accumulatedCosts.toFixed(2)}
        </p>
        <p className="text-lg">
          <span className="font-medium">Cost Distribution:</span> {costDistribution || "Not specified"}
        </p>
      </div>

      {/* Transactions Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>
        {transactions && transactions.length > 0 ? (
          <ul className="space-y-3">
            {transactions.map((transaction, index) => (
              <li key={index} className="p-4 bg-gray-50 rounded-md shadow">
                <p className="text-lg font-medium">Description: {transaction.description}</p>
                <p className="text-sm text-gray-600">Amount: ${transaction.amount.toFixed(2)}</p>
                <p className="text-sm text-gray-600">
                  Date: {new Date(transaction.date).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No transactions available.</p>
        )}
      </div>
    </div>
  );
};

export default Economy;
