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
      className="glass-panel w-full rounded-2xl"
    >
      {items.map((item, i) => (
        <AccordionItem
          key={i}
          value={`item-${i}`}
          className="border-b border-border/40 px-5 last:border-b-0"
        >
          <AccordionTrigger className="py-5 text-left text-base font-medium hover:no-underline data-[state=open]:text-accent">
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
