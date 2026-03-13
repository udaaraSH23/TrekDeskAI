import React, { useState } from "react";
import {
  Map,
  Plus,
  Search,
  Trash2,
  Edit2,
  Save,
  X,
  TrendingUp,
  Navigation,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import {
  useTours,
  useCreateTour,
  useUpdateTour,
  useDeleteTour,
} from "../hooks/useTours";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import type { Trek, DifficultyLevel } from "../types/tour.types";

const Tours: React.FC = () => {
  const { data: tours = [], isLoading: loading, error } = useTours();
  const createMutation = useCreateTour();
  const updateMutation = useUpdateTour();
  const deleteMutation = useDeleteTour();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    base_price_per_person: 0,
    transport_fee: 0,
    difficulty_level: "moderate" as DifficultyLevel,
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    base_price_per_person: 0,
    transport_fee: 0,
    difficulty_level: "moderate" as DifficultyLevel,
  });

  const filteredTours = tours.filter((tour) =>
    tour.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(formData);
    setIsAdding(false);
    setFormData({
      name: "",
      description: "",
      base_price_per_person: 0,
      transport_fee: 0,
      difficulty_level: "moderate",
    });
  };

  const handleUpdate = async (id: string) => {
    await updateMutation.mutateAsync({ id, tour: editFormData });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this tour?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const startEdit = (tour: Trek) => {
    setEditingId(tour.id);
    setEditFormData({
      name: tour.name,
      description: tour.description || "",
      base_price_per_person: tour.base_price_per_person,
      transport_fee: tour.transport_fee,
      difficulty_level: tour.difficulty_level || "moderate",
    });
  };

  return (
    <div style={containerStyle}>
      <div style={searchRowStyle}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div style={searchBoxStyle}>
            <Search size={16} color="var(--muted-foreground)" />
            <Input
              placeholder="Search tours..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: "none", background: "transparent" }}
            />
          </div>
          <Badge variant="secondary">
            {filteredTours.length}{" "}
            {filteredTours.length === 1 ? "Tour" : "Tours"}
          </Badge>
        </div>
        <Button
          onClick={() => setIsAdding(true)}
          icon={<Plus size={18} />}
          disabled={isAdding}
          size="sm"
        >
          Add New Tour
        </Button>
      </div>

      {error && (
        <div style={errorBannerStyle}>
          <AlertCircle size={18} style={{ marginRight: "8px" }} />
          {error instanceof Error ? error.message : "Failed to load tours"}
        </div>
      )}

      <div style={searchRowStyle}>
        <div style={searchBoxStyle}>
          <Search size={16} color="var(--muted-foreground)" />
          <Input
            placeholder="Search tours..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: "none", background: "transparent" }}
          />
        </div>
        <Badge variant="secondary">
          {filteredTours.length} {filteredTours.length === 1 ? "Tour" : "Tours"}
        </Badge>
      </div>

      <div style={mainGridStyle}>
        {isAdding && (
          <Card style={editCardStyle}>
            <CardHeader style={{ border: "none" }}>
              <CardTitle>Create New Tour</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} style={formStyle}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Tour Name</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Knuckles Forest Reserve"
                  />
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    style={textareaStyle}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Provide details for the AI..."
                  />
                </div>
                <div style={formRowStyle}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Base Price ($)</label>
                    <Input
                      type="number"
                      value={formData.base_price_per_person}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          base_price_per_person: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Transport Fee ($)</label>
                    <Input
                      type="number"
                      value={formData.transport_fee}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          transport_fee: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Difficulty</label>
                  <select
                    style={selectStyle}
                    value={formData.difficulty_level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        difficulty_level: e.target.value as DifficultyLevel,
                      })
                    }
                  >
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="challenging">Challenging</option>
                    <option value="extreme">Extreme</option>
                  </select>
                </div>
                <div style={formActionsStyle}>
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setIsAdding(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={createMutation.isPending}>
                    Save Tour
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {filteredTours.length === 0 && !loading && !isAdding && (
          <div style={emptyStateStyle}>
            <Navigation
              size={48}
              color="var(--border)"
              style={{ marginBottom: "1rem" }}
            />
            <p style={{ color: "var(--muted-foreground)" }}>
              No tours found matching your search.
            </p>
          </div>
        )}

        {loading && tours.length === 0 ? (
          <div style={emptyStateStyle}>Loading tours...</div>
        ) : (
          filteredTours.map((tour) => (
            <Card key={tour.id} style={tourCardStyle}>
              {editingId === tour.id ? (
                <CardContent style={{ padding: "1.5rem" }}>
                  <div style={formStyle}>
                    <div style={inputGroupStyle}>
                      <Input
                        required
                        value={editFormData.name}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <textarea
                      style={{ ...textareaStyle, height: "100px" }}
                      value={editFormData.description}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          description: e.target.value,
                        })
                      }
                    />
                    <div style={formRowStyle}>
                      <Input
                        type="number"
                        value={editFormData.base_price_per_person}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            base_price_per_person: Number(e.target.value),
                          })
                        }
                      />
                      <Input
                        type="number"
                        value={editFormData.transport_fee}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            transport_fee: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <select
                      style={selectStyle}
                      value={editFormData.difficulty_level}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          difficulty_level: e.target.value as DifficultyLevel,
                        })
                      }
                    >
                      <option value="easy">Easy</option>
                      <option value="moderate">Moderate</option>
                      <option value="challenging">Challenging</option>
                      <option value="extreme">Extreme</option>
                    </select>
                    <div style={{ ...formActionsStyle, marginTop: "1rem" }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(null)}
                      >
                        <X size={14} />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdate(tour.id)}
                        isLoading={updateMutation.isPending}
                      >
                        <Save size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              ) : (
                <>
                  <CardHeader style={cardHeaderStyle}>
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                      }}
                    >
                      <div style={iconBoxStyle}>
                        <Map size={18} color="var(--primary)" />
                      </div>
                      <CardTitle style={{ fontSize: "1.1rem" }}>
                        {tour.name}
                      </CardTitle>
                    </div>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(tour)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(tour.id)}
                        isLoading={deleteMutation.isPending}
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent style={{ padding: "0 1.5rem 1.5rem" }}>
                    <p style={descriptionStyle}>
                      {tour.description || "No description provided."}
                    </p>
                    <div style={statsRowStyle}>
                      <div style={statItemStyle}>
                        <DollarSign size={14} />
                        <span>${tour.base_price_per_person} /pp</span>
                      </div>
                      <div style={statItemStyle}>
                        <TrendingUp size={14} />
                        <span style={{ textTransform: "capitalize" }}>
                          {tour.difficulty_level}
                        </span>
                      </div>
                    </div>
                    <div style={footerRowStyle}>
                      <Badge variant={tour.is_active ? "success" : "secondary"}>
                        {tour.is_active ? "Live" : "Draft"}
                      </Badge>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--muted-foreground)",
                        }}
                      >
                        Updated {new Date(tour.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  animation: "fadeIn 0.5s ease-out",
};
const searchRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1.5rem",
};
const searchBoxStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  backgroundColor: "rgba(255,255,255,0.03)",
  border: "1px solid var(--border)",
  padding: "4px 12px",
  borderRadius: "8px",
  width: "300px",
};
const mainGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: "1.5rem",
};
const tourCardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s ease",
};
const cardHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  border: "none",
  padding: "1.5rem",
};
const iconBoxStyle: React.CSSProperties = {
  width: "36px",
  height: "36px",
  borderRadius: "8px",
  backgroundColor: "rgba(16, 185, 129, 0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const descriptionStyle: React.CSSProperties = {
  fontSize: "0.9rem",
  color: "var(--muted-foreground)",
  lineHeight: "1.5",
  marginBottom: "1.5rem",
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  height: "4.5em",
};
const statsRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "1.5rem",
  marginBottom: "1rem",
};
const statItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "0.85rem",
  color: "var(--foreground)",
  fontWeight: 600,
};
const footerRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingTop: "1rem",
  borderTop: "1px solid var(--border)",
};
const emptyStateStyle: React.CSSProperties = {
  gridColumn: "1 / -1",
  textAlign: "center",
  padding: "4rem 0",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};
const errorBannerStyle: React.CSSProperties = {
  backgroundColor: "rgba(239, 68, 68, 0.1)",
  color: "#ef4444",
  padding: "1rem",
  borderRadius: "10px",
  marginBottom: "1.5rem",
  border: "1px solid rgba(239, 68, 68, 0.2)",
  display: "flex",
  alignItems: "center",
};

// Form Styles
const editCardStyle: React.CSSProperties = {
  gridColumn: "1 / -1",
  maxWidth: "600px",
  margin: "0 auto 1rem",
  animation: "slideDown 0.3s ease-out",
};
const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};
const inputGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};
const formRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "1rem",
};
const labelStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "var(--muted-foreground)",
};
const textareaStyle: React.CSSProperties = {
  width: "100%",
  height: "150px",
  backgroundColor: "rgba(255,255,255,0.03)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  padding: "0.8rem",
  color: "white",
  fontSize: "0.9rem",
  outline: "none",
  resize: "none",
};
const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.8rem",
  backgroundColor: "rgba(255,255,255,0.03)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "white",
  outline: "none",
};
const formActionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  marginTop: "0.5rem",
};

export default Tours;
