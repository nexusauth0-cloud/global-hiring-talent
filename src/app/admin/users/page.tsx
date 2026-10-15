import type { Metadata } from "next";
import { Badge, Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAuthContext } from "@/lib/auth/session";
import { getAdminUsers } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { UserControls } from "./UserControls";

export const metadata: Metadata = { title: "Users" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const ctx = await getAuthContext();
  const users = await getAdminUsers();
  const canManage = ctx?.user.role === "admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-900">Users</h1>
        <p className="mt-1 text-sm text-slate-600">
          {canManage
            ? "Manage account roles and activation."
            : "Read-only view. Only administrators can change roles or activation."}
        </p>
      </div>

      {users.length === 0 ? (
        <EmptyState title="No users yet" />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                    <th scope="col" className="px-5 py-3 font-semibold">Email</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Role</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Verified</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Joined</th>
                    {canManage && <th scope="col" className="px-5 py-3" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4 font-semibold text-brand-900">
                        {user.email}
                      </td>
                      <td className="px-5 py-4">
                        <Badge tone="brand">{user.role}</Badge>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {user.emailVerifiedAt ? "Yes" : "No"}
                      </td>
                      <td className="px-5 py-4">
                        <Badge tone={user.isActive ? "success" : "danger"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(user.createdAt)}
                      </td>
                      {canManage && (
                        <td className="px-5 py-4">
                          <UserControls
                            userId={user.id}
                            role={user.role}
                            isActive={user.isActive}
                          />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
