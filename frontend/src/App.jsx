import { useMemo, useState } from "react";
import "./App.css";

const initialOrders = [
  {
    id: "SO1001",
    customer: "ABC Technologies",
    amount: 85000,
    paymentStatus: "Paid",
    orderDate: "2026-08-01",
    releaseDate: "2026-08-02",
    deliveryDate: "2026-08-04",
    invoiceDate: "2026-08-05",
    dueDate: "2026-08-10",
    paymentDate: "2026-08-09",
    status: "Release",
  },

  {
    id: "SO1002",
    customer: "XYZ Solutions",
    amount: 150000,
    paymentStatus: "Overdue",
    orderDate: "2026-08-02",
    releaseDate: null,
    deliveryDate: null,
    invoiceDate: null,
    dueDate: "2026-08-10",
    paymentDate: null,
    status: "Reject",
  },

  {
    id: "SO1003",
    customer: "PQR Industries",
    amount: 92000,
    paymentStatus: "Pending",
    orderDate: "2026-08-03",
    releaseDate: null,
    deliveryDate: null,
    invoiceDate: null,
    dueDate: "2026-08-15",
    paymentDate: null,
    status: "Hold",
  },

  {
    id: "SO1004",
    customer: "Global Systems",
    amount: 125000,
    paymentStatus: "Paid",
    orderDate: "2026-08-04",
    releaseDate: "2026-08-05",
    deliveryDate: "2026-08-07",
    invoiceDate: "2026-08-08",
    dueDate: "2026-08-15",
    paymentDate: "2026-08-14",
    status: "Release",
  },

  {
    id: "SO1005",
    customer: "Delta Corp",
    amount: 65000,
    paymentStatus: "Failed",
    orderDate: "2026-08-05",
    releaseDate: null,
    deliveryDate: null,
    invoiceDate: null,
    dueDate: "2026-08-12",
    paymentDate: null,
    status: "Reject",
  },
  {
    id: "SO1006",
    customer: "Omega Enterprises",
    amount: 78000,
    paymentStatus: "Pending",
    orderDate: "2026-08-06",
    releaseDate: null,
    deliveryDate: null,
    invoiceDate: null,
    dueDate: "2026-08-18",
    paymentDate: 2026-09-20,
    status: "Hold", 
  },
];

function App() {
  const [orders, setOrders] = useState(initialOrders);

  const [search, setSearch] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);

  // ---------------------------------------
  // BUSINESS RULE
  // ---------------------------------------

  const getRecommendedStatus = (paymentStatus) => {
    switch (paymentStatus) {
      case "Paid":
        return "Release";

      case "Pending":
        return "Hold";
      
      case "Pending":
        return "Hold";

      case "Overdue":
      case "Failed":
        return "Reject";

      default:
        return "Hold";
    }
  };

  // ---------------------------------------
  // STATUS COLORS
  // ---------------------------------------

  const getStatusBadge = (status) => {
    if (status === "Release") return "status-release";

    if (status === "Hold") return "status-hold";

    if (status === "Reject") return "status-reject";

    return "";
  };

  const getPaymentBadge = (status) => {
    if (status === "Paid") return "payment-paid";

    if (status === "Pending") return "payment-pending";

    if (status === "Overdue") return "payment-overdue";

    if (status === "Failed") return "payment-failed";

    return "";
  };

  // ---------------------------------------
  // UPDATE STATUS
  // ---------------------------------------

  const updateStatus = (orderId, newStatus) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
            }
          : order
      )
    );

    if (selectedOrder?.id === orderId) {
      setSelectedOrder({
        ...selectedOrder,
        status: newStatus,
      });
    }
  };

  // ---------------------------------------
  // KPI CALCULATIONS
  // ---------------------------------------

  const totalOrders = orders.length;

  const releasedOrders = orders.filter(
    (order) => order.status === "Release"
  ).length;

  const holdOrders = orders.filter(
    (order) => order.status === "Hold"
  ).length;

  const rejectedOrders = orders.filter(
    (order) => order.status === "Reject"
  ).length;

  // Release Rate

  const releaseRate =
    totalOrders === 0
      ? 0
      : (releasedOrders / totalOrders) * 100;

  // Hold Rate

  const holdRate =
    totalOrders === 0
      ? 0
      : (holdOrders / totalOrders) * 100;

  // Rejection Rate

  const rejectionRate =
    totalOrders === 0
      ? 0
      : (rejectedOrders / totalOrders) * 100;

  // ---------------------------------------
  // ON-TIME PAYMENT RATE
  // ---------------------------------------

  const paidOrders = orders.filter(
    (order) =>
      order.paymentStatus === "Paid" &&
      order.paymentDate
  );

  const onTimePayments = paidOrders.filter((order) => {
    return (
      new Date(order.paymentDate) <=
      new Date(order.dueDate)
    );
  }).length;

  const onTimePaymentRate =
    paidOrders.length === 0
      ? 0
      : (onTimePayments / paidOrders.length) * 100;

  // ---------------------------------------
  // O2C CYCLE TIME
  // ---------------------------------------

  const completedOrders = orders.filter(
    (order) =>
      order.orderDate &&
      order.paymentDate
  );

  const calculateDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const difference =
      endDate.getTime() - startDate.getTime();

    return Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );
  };

  const totalCycleDays = completedOrders.reduce(
    (total, order) =>
      total +
      calculateDays(
        order.orderDate,
        order.paymentDate
      ),
    0
  );

  const averageO2CCycleTime =
    completedOrders.length === 0
      ? 0
      : totalCycleDays / completedOrders.length;

  // ---------------------------------------
  // TOTAL ORDER VALUE
  // ---------------------------------------

  const totalValue = orders.reduce(
    (total, order) =>
      total + Number(order.amount),
    0
  );

  // ---------------------------------------
  // PROBLEM ORDERS
  // ---------------------------------------

  const problemOrders = orders.filter(
    (order) =>
      order.status === "Hold" ||
      order.status === "Reject"
  );

  // ---------------------------------------
  // SEARCH
  // ---------------------------------------

  const filteredOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.id
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        order.customer
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }, [orders, search]);

  // ---------------------------------------
  // KPI STATUS
  // ---------------------------------------

  const getKPIStatus = (value, target, type) => {
    if (type === "higher") {
      return value >= target
        ? "✓ On Target"
        : "⚠ Below oTarget";
    }

    return value <= target
      ? "✓ On Target"
      : "⚠ Above Target";
  };

  return (
    <div className="app-container">

      {/* NAVBAR */}

      <nav className="navbar navbar-dark bg-dark px-4">

        <span className="navbar-brand fw-bold">
          O2C Credit Release Cockpit
        </span>

        <span className="text-light">
          Sales Manager
        </span>

      </nav>

      <div className="container-fluid p-4">

        {/* HEADER */}

        <div className="mb-4">

          <h2 className="fw-bold">
            O2C Performance Dashboard
          </h2>

          <p className="text-muted">
            Monitor sales orders, payment performance
            and order-to-cash efficiency.
          </p>

        </div>

        {/* ==================================
            KPI SECTION
            ================================== */}

        <div className="row g-3 mb-4">

          {/* RELEASE RATE */}

          <div className="col-lg-3 col-md-6">

            <div className="card shadow-sm border-0 kpi-card">

              <div className="card-body">

                <p className="text-muted mb-1">
                  Release Rate
                </p>

                <h2 className="fw-bold text-success">
                  {releaseRate.toFixed(1)}%
                </h2>

                <small>
                  Target: &gt; 80%
                </small>

                <div
                  className={
                    releaseRate >= 80
                      ? "kpi-good"
                      : "kpi-warning"
                  }
                >
                  {getKPIStatus(
                    releaseRate,
                    80,
                    "higher"
                  )}
                </div>

              </div>

            </div>

          </div>

          {/* HOLD RATE */}

          <div className="col-lg-3 col-md-6">

            <div className="card shadow-sm border-0 kpi-card">

              <div className="card-body">

                <p className="text-muted mb-1">
                  Hold Rate
                </p>

                <h2 className="fw-bold text-warning">
                  {holdRate.toFixed(1)}%
                </h2>

                <small>
                  Target: &lt; 15%
                </small>

                <div
                  className={
                    holdRate <= 15
                      ? "kpi-good"
                      : "kpi-warning"
                  }
                >
                  {getKPIStatus(
                    holdRate,
                    15,
                    "lower"
                  )}
                </div>

              </div>

            </div>

          </div>

          {/* REJECTION RATE */}

          <div className="col-lg-3 col-md-6">

            <div className="card shadow-sm border-0 kpi-card">

              <div className="card-body">

                <p className="text-muted mb-1">
                  Rejection Rate
                </p>

                <h2 className="fw-bold text-danger">
                  {rejectionRate.toFixed(1)}%
                </h2>

                <small>
                  Target: &lt; 5%
                </small>

                <div
                  className={
                    rejectionRate <= 5
                      ? "kpi-good"
                      : "kpi-warning"
                  }
                >
                  {getKPIStatus(
                    rejectionRate,
                    5,
                    "lower"
                  )}
                </div>

              </div>

            </div>

          </div>

          {/* PAYMENT RATE */}

          <div className="col-lg-3 col-md-6">

            <div className="card shadow-sm border-0 kpi-card">

              <div className="card-body">

                <p className="text-muted mb-1">
                  On-Time Payment
                </p>

                <h2 className="fw-bold text-primary">
                  {onTimePaymentRate.toFixed(1)}%
                </h2>

                <small>
                  Target: &gt; 90%
                </small>

                <div
                  className={
                    onTimePaymentRate >= 90
                      ? "kpi-good"
                      : "kpi-warning"
                  }
                >
                  {getKPIStatus(
                    onTimePaymentRate,
                    90,
                    "higher"
                  )}
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* SECOND KPI ROW */}

        <div className="row g-3 mb-4">

          <div className="col-md-4">

            <div className="card shadow-sm border-0">

              <div className="card-body">

                <p className="text-muted mb-1">
                  Average O2C Cycle Time
                </p>

                <h3 className="fw-bold">
                  {averageO2CCycleTime.toFixed(1)}
                  {" "}days
                </h3>

                <small>
                  Target: &lt; 7 days
                </small>

              </div>

            </div>

          </div>

          <div className="col-md-4">

            <div className="card shadow-sm border-0">

              <div className="card-body">

                <p className="text-muted mb-1">
                  Total Order Value
                </p>

                <h3 className="fw-bold">
                  ₹{totalValue.toLocaleString("en-IN")}
                </h3>

              </div>

            </div>

          </div>

          <div className="col-md-4">

            <div className="card shadow-sm border-0">

              <div className="card-body">

                <p className="text-muted mb-1">
                  Orders Requiring Attention
                </p>

                <h3 className="fw-bold text-danger">
                  {problemOrders.length}
                </h3>

                <small>
                  Hold + Reject
                </small>

              </div>

            </div>

          </div>

        </div>

        {/* ==================================
            PROBLEM SUMMARY
            ================================== */}

        <div className="card shadow-sm border-0 mb-4">

          <div className="card-header bg-white">

            <h5 className="fw-bold mb-0">
              ⚠ Problems Requiring Attention
            </h5>

          </div>

          <div className="card-body">

            <div className="row">

              <div className="col-md-4">

                <div className="problem-box">

                  <h4 className="text-warning">
                    {holdOrders}
                  </h4>

                  <p>
                    Orders on Hold
                  </p>

                  <small>
                    Requires manager review
                  </small>

                </div>

              </div>

              <div className="col-md-4">

                <div className="problem-box">

                  <h4 className="text-danger">
                    {rejectedOrders}
                  </h4>

                  <p>
                    Rejected Orders
                  </p>

                  <small>
                    Payment or credit issue
                  </small>

                </div>

              </div>

              <div className="col-md-4">

                <div className="problem-box">

                  <h4 className="text-primary">
                    {(100 - onTimePaymentRate).toFixed(1)}%
                  </h4>

                  <p>
                    Late / Pending Payments
                  </p>

                  <small>
                    Needs collection attention
                  </small>

                </div>

              </div>

            </div>

            <button
              className="btn btn-outline-danger mt-3"
              onClick={() => {
                setSearch("");
              }}
            >
              View Problem Orders
            </button>

          </div>

        </div>

        {/* ==================================
            SEARCH
            ================================== */}

        <div className="card shadow-sm border-0 mb-4">

          <div className="card-body">

            <input
              type="text"
              className="form-control"
              placeholder="Search Order ID or Customer..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

        </div>

        {/* ==================================
            ORDERS
            ================================== */}

        <div className="card shadow-sm border-0">

          <div className="card-header bg-white">

            <h5 className="fw-bold mb-0">
              Sales Orders
            </h5>

          </div>

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead className="table-light">

                <tr>

                  <th>Order</th>

                  <th>Customer</th>

                  <th>Amount</th>

                  <th>Payment</th>

                  <th>Recommendation</th>

                  <th>Status</th>

                  <th>Action</th>

                </tr>

              </thead>

              <tbody>

                {filteredOrders.map((order) => {

                  const recommendedStatus =
                    getRecommendedStatus(
                      order.paymentStatus
                    );

                  return (

                    <tr key={order.id}>

                      <td>

                        <button
                          className="btn btn-link fw-bold p-0"
                          onClick={() =>
                            setSelectedOrder(order)
                          }
                        >
                          {order.id}
                        </button>

                      </td>

                      <td>
                        {order.customer}
                      </td>

                      <td>
                        ₹
                        {order.amount.toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td>

                        <span
                          className={`badge ${getPaymentBadge(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>

                      </td>

                      <td>

                        <span
                          className={`badge ${getStatusBadge(
                            recommendedStatus
                          )}`}
                        >
                          {recommendedStatus}
                        </span>

                      </td>

                      <td>

                        <span
                          className={`badge ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>

                      </td>

                      <td>

                        <button
                          className="btn btn-sm btn-success me-1"
                          onClick={() =>
                            updateStatus(
                              order.id,
                              "Release"
                            )
                          }
                        >
                          Release
                        </button>

                        <button
                          className="btn btn-sm btn-warning me-1"
                          onClick={() =>
                            updateStatus(
                              order.id,
                              "Hold"
                            )
                          }
                        >
                          Hold
                        </button>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() =>
                            updateStatus(
                              order.id,
                              "Reject"
                            )
                          }
                        >
                          Reject
                        </button>

                      </td>

                    </tr>

                  );
                })}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* ==================================
          ORDER DETAILS
          ================================== */}

      {selectedOrder && (

        <div
          className="modal d-block"
          style={{
            backgroundColor:
              "rgba(0,0,0,0.5)",
          }}
        >

          <div className="modal-dialog modal-lg">

            <div className="modal-content">

              <div className="modal-header">

                <h5 className="modal-title">
                  Order Details
                </h5>

                <button
                  className="btn-close"
                  onClick={() =>
                    setSelectedOrder(null)
                  }
                />

              </div>

              <div className="modal-body">

                <h5 className="fw-bold">
                  {selectedOrder.id}
                </h5>

                <hr />

                <div className="row g-3">

                  <div className="col-md-6">

                    <strong>
                      Customer
                    </strong>

                    <p>
                      {selectedOrder.customer}
                    </p>

                  </div>

                  <div className="col-md-6">

                    <strong>
                      Order Amount
                    </strong>

                    <p>
                      ₹
                      {selectedOrder.amount.toLocaleString(
                        "en-IN"
                      )}
                    </p>

                  </div>

                  <div className="col-md-6">

                    <strong>
                      Payment Status
                    </strong>

                    <p>

                      <span
                        className={`badge ${getPaymentBadge(
                          selectedOrder.paymentStatus
                        )}`}
                      >
                        {selectedOrder.paymentStatus}
                      </span>

                    </p>

                  </div>

                  <div className="col-md-6">

                    <strong>
                      Current Status
                    </strong>

                    <p>

                      <span
                        className={`badge ${getStatusBadge(
                          selectedOrder.status
                        )}`}
                      >
                        {selectedOrder.status}
                      </span>

                    </p>

                  </div>

                  <div className="col-md-6">

                    <strong>
                      Order Date
                    </strong>

                    <p>
                      {selectedOrder.orderDate}
                    </p>

                  </div>

                  <div className="col-md-6">

                    <strong>
                      Due Date
                    </strong>

                    <p>
                      {selectedOrder.dueDate}
                    </p>

                  </div>

                  <div className="col-md-6">

                    <strong>
                      Payment Date
                    </strong>

                    <p>
                      {selectedOrder.paymentDate ||
                        "Not Paid"}
                    </p>

                  </div>

                </div>

                <hr />

                <div className="alert alert-info">

                  <strong>
                    Decision Recommendation
                  </strong>

                  <p className="mb-0 mt-2">

                    Based on the current payment status,
                    recommended action is:

                    {" "}

                    <strong>
                      {getRecommendedStatus(
                        selectedOrder.paymentStatus
                      )}
                    </strong>

                  </p>

                </div>

              </div>

              <div className="modal-footer">

                <button
                  className="btn btn-success"
                  onClick={() => {
                    updateStatus(
                      selectedOrder.id,
                      "Release"
                    );

                    setSelectedOrder(null);
                  }}
                >
                  Release
                </button>

                <button
                  className="btn btn-warning"
                  onClick={() => {
                    updateStatus(
                      selectedOrder.id,
                      "Hold"
                    );

                    setSelectedOrder(null);
                  }}
                >
                  Hold
                </button>

                <button
                  className="btn btn-danger"
                  onClick={() => {
                    updateStatus(
                      selectedOrder.id,
                      "Reject"
                    );

                    setSelectedOrder(null);
                  }}
                >
                  Reject
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;

