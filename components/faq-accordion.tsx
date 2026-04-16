"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export type FAQ = { q: string; a: string }

export function FAQAccordion({ items }: { items: FAQ[] }) {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full divide-y divide-border rounded-xl border border-border bg-card"
    >
      {items.map((item, i) => (
        <AccordionItem
          key={i}
          value={`item-${i}`}
          className="border-b-0 px-5"
        >
          <AccordionTrigger className="py-5 text-left text-base font-medium hover:no-underline">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
