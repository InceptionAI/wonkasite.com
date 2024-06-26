/* eslint-disable react/display-name */
"use client";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon, Bars3Icon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, forwardRef, useEffect, useState } from "react";

import { createLink } from "@/lib/create-link";
import { LocaleDetails } from "@/types/languages";
import { MenuContent } from "@/types/ui-content";

type MobileMenuProps = {
  menu: MenuContent[];
  locale: LocaleDetails;
  searchbar?: boolean;
};

const MyDialogPanel = forwardRef(function (props: any, ref: any) {
  return (
    <DialogPanel className="max-w-xl bg-light p-12" ref={ref} {...props} />
  );
});

export default function MobileMenu({
  menu,
  searchbar,
  locale,
}: MobileMenuProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const openMobileMenu = () => setIsOpen(true);
  const closeMobileMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        onClick={openMobileMenu}
        aria-label="Open mobile menu"
        className="flex h-11 w-11 items-center justify-center rounded-md text-black transition-colors dark:border-neutral-700 dark:text-light max-md:mx-4 md:hidden"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>
      <Transition
        as={Dialog}
        show={isOpen}
        onClose={closeMobileMenu}
        className="relative z-50 flex"
      >
        <div>
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </div>
        <TransitionChild
          as={MyDialogPanel}
          enter="transition-all ease-in-out duration-300"
          enterFrom="translate-x-[-100%]"
          enterTo="translate-x-0"
          leave="transition-all ease-in-out duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-[-100%]"
          className="fixed bottom-0 left-0 right-0 top-0 flex h-full w-72 max-w-full flex-col bg-light pb-6 dark:bg-black"
        >
          <div className="p-4">
            <button
              className="mb-4 flex h-11 w-11 items-center justify-center rounded-md transition-colors"
              onClick={closeMobileMenu}
              aria-label="Close mobile menu"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {searchbar ? (
              <div className="mb-4 w-full">{/* <Search /> */}</div>
            ) : null}
            {menu.length ? (
              <ul className="flex w-full flex-col">
                {menu.map((item: MenuContent) => (
                  <li
                    className="py-2 text-xl transition-colors dark:text-white"
                    key={item.title}
                  >
                    <Link
                      href={createLink(item, locale)}
                      onClick={closeMobileMenu}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </TransitionChild>
      </Transition>
    </>
  );
}
