import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export const Sidebar = () => {
  return (
    <div className="fixed left-0 top-[130px] w-[280px] bg-white border-r border-gray-300 h-[calc(100vh-100px)] p-6 shadow-md">
      {/* Heading */}
      <h2 className="text-xl font-bold mb-4">Filter & Sort</h2>
      <hr className="border-gray-300 mb-4" /> {/* Divider Line */}

      {/* Accordion Section */}
      <Accordion type="single" collapsible className="w-full">
        {/* Sort By */}
        <AccordionItem value="sort" className="w-full">
          <AccordionTrigger className="text-lg w-full">Sort By</AccordionTrigger>
          <AccordionContent className="w-full">
            <div className="flex flex-col space-y-3 w-full">
              <label className="w-full p-3 bg-gray-200 rounded-md">
                <input type="radio" name="sort" className="mr-2" />
                Stock (Low to High)
              </label>
              <label className="w-full p-3 bg-gray-200 rounded-md">
                <input type="radio" name="sort" className="mr-2" />
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
                <input type="checkbox" className="mr-2" />
                Acne Studios
              </label>
              <label className="w-full p-3 bg-gray-200 rounded-md">
                <input type="checkbox" className="mr-2" />
                Ami Paris
              </label>
              <label className="w-full p-3 bg-gray-200 rounded-md">
                <input type="checkbox" className="mr-2" />
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
                <input type="radio" name="availability" className="mr-2" />
                In Stock
              </label>
              <label className="w-full p-3 bg-gray-200 rounded-md">
                <input type="radio" name="availability" className="mr-2" />
                Out of Stock
              </label>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Sidebar;
