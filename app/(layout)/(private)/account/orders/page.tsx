"use client";
import { Card } from "@/components/ui/card";

export default function OrdersPage() {
    const orders = [
        { id: 1, title: "Amul Butter", amount: 122, date: "26 Oct 2025" },
        { id: 2, title: "Mother Dairy Curd", amount: 84, date: "27 May 2025" },
    ];

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">My Orders</h2>
            <div className="space-y-4">
                {orders.map((order) => (
                    <Card key={order.id} className="p-4 flex justify-between items-center">
                        <div>
                            <p className="font-medium text-gray-800">{order.title}</p>
                            <p className="text-sm text-gray-500">Placed on {order.date}</p>
                        </div>
                        <p className="font-semibold text-gray-800">₹{order.amount}</p>
                    </Card>
                ))}
            </div>
        </div>
    );
}
