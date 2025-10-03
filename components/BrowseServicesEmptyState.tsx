"use client";

import React, { useEffect, useState } from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";
import { useRouter } from "next/navigation";
import { setServiceToCache } from "@/lib/serviceCache";


export interface Service {
  _id: string;
  displayName: string;
  description: string;
  price: number;
  currency: string;
  image?: string;
}
export function BrowseServicesEmptyState() {


  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });

  const fetchServices = async () => {
    if (loading || page > pagination.totalPages) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/services?page=${page}&limit=${limit}`);
      const data = await res.json();

      if (data.success) {
        // Deduplicate by _id
        setServices((prev) => {
          const ids = new Set(prev.map((s) => s._id));
          const newServices = data.data.filter((s: Service) => !ids.has(s._id));
          return [...prev, ...newServices];
        });
        console.log(data.data);
        sessionStorage.setItem('servicesCache', JSON.stringify(data.data));
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to load services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [page]);

  const cards = services.map((service, index) => (
    <Card
      key={service._id}
      card={{
        category: "Service",
        title: service.displayName,
        src: service.image || "https://via.placeholder.com/500x300?text=Service",
        content: (
          <div className="p-4">
            <p className="text-neutral-600 dark:text-neutral-400">
              {service.description}
            </p>
            <p className="mt-2 font-bold">
              {service.price} {service.currency}
            </p>

            {/* Proceed button inside the expanded content */}
            <div className="mt-4 text-center">
              <button
                onClick={() =>
                  router.push(`/checkout?serviceid=${service._id}`)
                }
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Proceed
              </button>
            </div>
          </div>
        ),
      }}
      index={index}
    />
  ));

  return (
    <div className="w-full h-full py-20">
      <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
        Explore Our Travel & Visa Services.
      </h2>

      {services.length === 0 && loading ? (
        <p className="text-center mt-10 text-neutral-500">Loading services...</p>
      ) : (
        <>
          <Carousel items={cards} />

          {/* Load More Button */}
          {page < pagination.totalPages && (
            <div className="text-center mt-6">
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={loading}
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
