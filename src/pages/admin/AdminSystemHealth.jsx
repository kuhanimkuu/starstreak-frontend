import SystemHealth from "./SystemHealth";

// Ops > System health: scheduled jobs, the edge-function calls they make
// (with which one failed and why), and push notifications.
export default function AdminSystemHealth() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-star">System health</h1>
        <p className="text-mist text-sm mt-1">
          Background jobs, the calls they make and push notifications. The hourly check emails an alert when something here goes wrong.
        </p>
      </div>
      <SystemHealth />
    </div>
  );
}
