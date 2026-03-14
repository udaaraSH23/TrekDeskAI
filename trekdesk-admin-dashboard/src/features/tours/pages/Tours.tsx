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
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
import type { Trek, DifficultyLevel } from "../types/tour.types";

import styles from "./Tours.module.css";

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
    <div className={styles.container}>
      <div className={styles.searchRow}>
        <div className="flex items-center gap-md">
          <div className={styles.searchBox}>
            <Search size={16} className="text-muted" />
            <Input
              placeholder="Search tours..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-none bg-transparent outline-none"
            />
          </div>
          <Badge variant="secondary">
            {filteredTours.length}{" "}
            {filteredTours.length === 1 ? "Tour" : "Tours"}
          </Badge>
        </div>
        <Button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-xs"
          disabled={isAdding}
          size="sm"
        >
          <Plus size={18} /> Add New Tour
        </Button>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={18} className="mr-sm" />
          {error instanceof Error ? error.message : "Failed to load tours"}
        </div>
      )}

      <div className={styles.mainGrid}>
        {isAdding && (
          <Card className={styles.editCard}>
            <CardHeader className="border-none">
              <CardTitle>Create New Tour</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Tour Name</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Knuckles Forest Reserve"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Description</label>
                  <textarea
                    className={styles.textarea}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Provide details for the AI..."
                  />
                </div>
                <div className={styles.formRow}>
                  <div className="flex-1">
                    <label className={styles.label}>Base Price ($)</label>
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
                  <div className="flex-1">
                    <label className={styles.label}>Transport Fee ($)</label>
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
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Difficulty</label>
                  <select
                    className={styles.select}
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
                <div className={styles.formActions}>
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
          <div className={styles.emptyState}>
            <Navigation size={48} className="text-border mb-md" />
            <p className="text-muted">No tours found matching your search.</p>
          </div>
        )}

        {loading && tours.length === 0 ? (
          <div className={styles.emptyState}>Loading tours...</div>
        ) : (
          filteredTours.map((tour) => (
            <Card key={tour.id} className={styles.tourCard}>
              {editingId === tour.id ? (
                <CardContent className="p-lg">
                  <div className={styles.form}>
                    <div className={styles.inputGroup}>
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
                      className={styles.textarea}
                      style={{ height: "100px" }}
                      value={editFormData.description}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          description: e.target.value,
                        })
                      }
                    />
                    <div className={styles.formRow}>
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
                      className={styles.select}
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
                    <div className={`${styles.formActions} mt-md`}>
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
                  <CardHeader className={styles.cardHeader}>
                    <div className="flex items-center gap-sm">
                      <div className={styles.iconBox}>
                        <Map size={18} color="var(--primary)" />
                      </div>
                      <CardTitle className="text-lg m-0">{tour.name}</CardTitle>
                    </div>
                    <div className="flex gap-xs">
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
                  <CardContent className="p-card-body">
                    <p className={styles.description}>
                      {tour.description || "No description provided."}
                    </p>
                    <div className={styles.statsRow}>
                      <div className={styles.statItem}>
                        <DollarSign size={14} />
                        <span>${tour.base_price_per_person} /pp</span>
                      </div>
                      <div className={styles.statItem}>
                        <TrendingUp size={14} />
                        <span className="capitalize">
                          {tour.difficulty_level}
                        </span>
                      </div>
                    </div>
                    <div className={styles.footerRow}>
                      <Badge variant={tour.is_active ? "success" : "secondary"}>
                        {tour.is_active ? "Live" : "Draft"}
                      </Badge>
                      <span className="text-muted text-xs">
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

export default Tours;
