import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const Sidebar = ({ setSortOrder, setFilterBySupplier, setFilterByAvailability }) => {
  // Handle adding/removing suppliers from the filter array
  const handleSupplierChange = (e) => {
    const { value, checked } = e.target;
    setFilterBySupplier((prev) => {
      if (checked) {
        return [...prev, value];
      } else {
        return prev.filter((supplier) => supplier !== value);
      }
    });
  };

  // Clear all filters: sort, suppliers, availability
  const handleClearAllFilters = () => {
    setSortOrder("");
    setFilterBySupplier([]);
    setFilterByAvailability("");
  };

  return (
    <div className="fixed left-0 top-[130px] w-[280px] bg-white border-r border-gray-300 h-[calc(100vh-100px)] p-6 shadow-md">
      {/* Heading */}
      <h2 className="text-xl font-bold mb-4">Filter & Sort</h2>
      <hr className="border-gray-300 mb-4" />

      {/* Accordion Section */}
      <Accordion type="single" collapsible className="w-full">
        {/* Sort By */}
        <AccordionItem value="sort" className="w-full">
          <AccordionTrigger className="text-lg w-full">Sort By</AccordionTrigger>
          <AccordionContent className="w-full">
            <div className="flex flex-col space-y-3 w-full">
              <label className="w-full p-3 bg-gray-200 rounded-md">
                <input
                  type="radio"
                  name="sort"
                  className="mr-2"
                  value="asc"
                  onChange={(e) => setSortOrder(e.target.value)}
                />
                Stock (Low to High)
              </label>
              <label className="w-full p-3 bg-gray-200 rounded-md">
                <input
                  type="radio"
                  name="sort"
                  className="mr-2"
                  value="desc"
                  onChange={(e) => setSortOrder(e.target.value)}
                />
                Stock (High to Low)
              </label>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Supplier */}
        <AccordionItem value="supplier" className="w-full">
          <AccordionTrigger className="text-lg w-full">Supplier</AccordionTrigger>
          <AccordionContent className="w-full">
            <div className="flex flex-col space-y-3 w-full">
              <label className="w-full p-3 bg-gray-200 rounded-md">
                <input
                  type="checkbox"
                  className="mr-2"
                  value="Acne Studios"
                  onChange={handleSupplierChange}
                />
                Acne Studios
              </label>
              <label className="w-full p-3 bg-gray-200 rounded-md">
                <input
                  type="checkbox"
                  className="mr-2"
                  value="Ami Paris"
                  onChange={handleSupplierChange}
                />
                Ami Paris
              </label>
              <label className="w-full p-3 bg-gray-200 rounded-md">
                <input
                  type="checkbox"
                  className="mr-2"
                  value="CHERRY LA"
                  onChange={handleSupplierChange}
                />
                CHERRY LA
              </label>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Availability */}
        <AccordionItem value="availability" className="w-full">
          <AccordionTrigger className="text-lg w-full">Availability</AccordionTrigger>
          <AccordionContent className="w-full">
            <div className="flex flex-col space-y-3 w-full">
              <label className="w-full p-3 bg-gray-200 rounded-md">
                <input
                  type="radio"
                  name="availability"
                  className="mr-2"
                  value="in_stock"
                  onChange={(e) => setFilterByAvailability(e.target.value)}
                />
                In Stock
              </label>
              <label className="w-full p-3 bg-gray-200 rounded-md">
                <input
                  type="radio"
                  name="availability"
                  className="mr-2"
                  value="out_of_stock"
                  onChange={(e) => setFilterByAvailability(e.target.value)}
                />
                Out of Stock
              </label>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Clear All Filters Button */}
      <button
        type="button"
        className="w-full p-3 bg-red-500 text-white rounded-md mt-6 hover:bg-red-600"
        onClick={handleClearAllFilters}
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default Sidebar;
