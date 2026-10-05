import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, it, vi } from "vitest";
import { applicationFixture } from "../../../test/applicationFixture";
import { createApplicationEvent } from "../api/applicationsApi";
import { ApplicationEventDialog } from "./ApplicationEventDialog";

vi.mock("../api/applicationsApi", () => ({ createApplicationEvent: vi.fn() }));

function renderActivity() {
  const close = vi.fn();
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  render(<QueryClientProvider client={client}><ApplicationEventDialog application={applicationFixture()} onClose={close} /></QueryClientProvider>);
  return { close, user: userEvent.setup() };
}

it("does not treat the initialized activity time as an edit", async () => {
  const { user, close } = renderActivity();
  expect(screen.getByLabelText(/Activity occurred at/)).not.toHaveValue("");
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  expect(close).toHaveBeenCalledOnce();
  expect(screen.queryByText("Discard changes?")).not.toBeInTheDocument();
});

it.each(["Cancel", "Escape", "backdrop"])("protects activity changes on %s and retains them for Keep editing", async method => {
  const { user, close } = renderActivity();
  await user.type(screen.getByRole("textbox", { name: "Activity note" }), "Followed up with recruiter");
  if (method === "Cancel") await user.click(screen.getByRole("button", { name: "Cancel" }));
  else if (method === "Escape") await user.keyboard("{Escape}");
  else {
    const backdrop = document.querySelector(".MuiDialog-container")!;
    fireEvent.mouseDown(backdrop);
    fireEvent.click(backdrop);
  }
  expect(screen.getByText("Discard changes?")).toBeInTheDocument();
  expect(close).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Keep editing" }));
  expect(await screen.findByRole("textbox", { name: "Activity note" })).toHaveValue("Followed up with recruiter");
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  await user.click(screen.getByRole("button", { name: /^Discard$/ }));
  expect(close).toHaveBeenCalledOnce();
});

it("returns to clean when changed activity values are restored", async () => {
  const { user, close } = renderActivity();
  await user.type(screen.getByRole("textbox", { name: "Activity note" }), "Temporary note");
  await user.clear(screen.getByRole("textbox", { name: "Activity note" }));
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  expect(close).toHaveBeenCalledOnce();
});

it("blocks closing while saving and preserves entered activity after a failure", async () => {
  const { user, close } = renderActivity();
  let rejectSave: (reason: Error) => void = () => {};
  vi.mocked(createApplicationEvent).mockImplementationOnce(() => new Promise((_, reject) => { rejectSave = reject; }));
  await user.type(screen.getByRole("textbox", { name: "Activity note" }), "My follow-up");
  await user.click(screen.getByRole("button", { name: "Save activity" }));
  await waitFor(() => expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled());
  await user.keyboard("{Escape}");
  expect(close).not.toHaveBeenCalled();
  rejectSave(new Error("Save failed"));
  await waitFor(() => expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled());
  expect(screen.getByRole("alert")).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "Activity note" })).toHaveValue("My follow-up");
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.getByText("Discard changes?")).toBeInTheDocument();
});
