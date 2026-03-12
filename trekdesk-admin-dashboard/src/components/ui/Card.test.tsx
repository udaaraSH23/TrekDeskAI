import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";

describe("Card Component", () => {
  it("renders card title and content", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>My Card</CardTitle>
        </CardHeader>
        <CardContent>Card Body Text</CardContent>
      </Card>,
    );
    expect(screen.getByText("My Card")).toBeInTheDocument();
    expect(screen.getByText("Card Body Text")).toBeInTheDocument();
  });
});
