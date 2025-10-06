import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

export default function Register() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { walletAddress, token } = useAppStore();

  const [registerForOther, setRegisterForOther] = useState(false);
  const [otherPublicKey, setOtherPublicKey] = useState("");

  const [form, setForm] = useState({
    type: "MANUFACTURER",
    legalName: "",
    businessRegNo: "",
    countryOfIncorporation: "",
    personName: "",
    designation: "",
    email: "",
    phone: "",
    address: "",
    // Manufacturer
    productCategoriesManufactured: "",
    certifications: "",
    // Supplier
    productCategoriesSupplied: "",
    sourceRegions: "",
    // Warehouse
    officeAddress: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletAddress) {
      toast.error("Please connect your wallet before registration.");
      return;
    }

    const targetPublicKey = registerForOther
      ? otherPublicKey.trim()
      : walletAddress;

    if (registerForOther && !otherPublicKey.trim()) {
      toast.error("Please provide a public key for the other wallet.");
      return;
    }

    if (!form.email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (form.countryOfIncorporation.length < 2) {
      toast.error("Country code must be at least 2 characters (e.g., US).");
      return;
    }

    try {
      setLoading(true);

      // 🔧 Build details dynamically by type
      let details: Record<string, any> = {};

      if (form.type === "MANUFACTURER") {
        details = {
          productCategoriesManufactured: form.productCategoriesManufactured
            ? form.productCategoriesManufactured.split(",").map((s) => s.trim())
            : [],
          certifications: form.certifications
            ? form.certifications.split(",").map((s) => s.trim())
            : [],
        };
      } else if (form.type === "SUPPLIER") {
        details = {
          productCategoriesSupplied: form.productCategoriesSupplied
            ? form.productCategoriesSupplied.split(",").map((s) => s.trim())
            : [],
          sourceRegions: form.sourceRegions
            ? form.sourceRegions.split(",").map((s) => s.trim().toUpperCase())
            : [],
        };
      } else if (form.type === "WAREHOUSE") {
        details = {
          officeAddress: form.officeAddress,
          countryOfIncorporation: form.countryOfIncorporation
            .trim()
            .toUpperCase(),
        };
      }

      const payload = {
        type: form.type,
        identification: {
          uuid: crypto.randomUUID(),
          publicKey: targetPublicKey,
          legalName: form.legalName,
          businessRegNo: form.businessRegNo,
          countryOfIncorporation: form.countryOfIncorporation
            .trim()
            .toUpperCase(),
        },
        contact: {
          personName: form.personName,
          designation: form.designation,
          email: form.email.trim(),
          phone: form.phone,
          address: form.address,
        },
        metadata: {
          publicKey: walletAddress, // your wallet
          smartContractRole: form.type,
          dateOfRegistration: new Date().toISOString().split("T")[0],
        },
        details,
      };

      console.log("📦 Registration payload:", payload);

      const response = await axios.post(
        "http://localhost:5000/api/registrations",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Registration successful!");
        navigate("/");
      } else {
        toast.error("Unexpected server response.");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Organization Registration
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Type */}
            <div className="grid gap-2">
              <Label htmlFor="type">Organization Type</Label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="border rounded-md p-2 bg-card"
              >
                <option value="MANUFACTURER">Manufacturer</option>
                <option value="SUPPLIER">Supplier</option>
                <option value="WAREHOUSE">Warehouse</option>
              </select>
            </div>

            {/* Register for other wallet */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="registerForOther"
                checked={registerForOther}
                onChange={(e) => setRegisterForOther(e.target.checked)}
              />
              <Label htmlFor="registerForOther">
                Register for another wallet
              </Label>
            </div>

            {registerForOther && (
              <div className="mt-2">
                <Label htmlFor="otherPublicKey">Other Wallet Public Key</Label>
                <Input
                  id="otherPublicKey"
                  name="otherPublicKey"
                  value={otherPublicKey}
                  onChange={(e) => setOtherPublicKey(e.target.value)}
                  placeholder="0x1234...abcd"
                  required={registerForOther}
                />
              </div>
            )}

            {/* Identification */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="legalName">Legal Name</Label>
                <Input
                  id="legalName"
                  name="legalName"
                  value={form.legalName}
                  onChange={handleChange}
                  placeholder="Organization Legal Name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="businessRegNo">Business Reg. No</Label>
                <Input
                  id="businessRegNo"
                  name="businessRegNo"
                  value={form.businessRegNo}
                  onChange={handleChange}
                  placeholder="REG-12345"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="countryOfIncorporation">Country</Label>
                <Input
                  id="countryOfIncorporation"
                  name="countryOfIncorporation"
                  value={form.countryOfIncorporation}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      countryOfIncorporation: e.target.value
                        .toUpperCase()
                        .slice(0, 3),
                    })
                  }
                  placeholder="US"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="info@organization.example"
                  required
                />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="personName">Contact Person</Label>
                <Input
                  id="personName"
                  name="personName"
                  value={form.personName}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  placeholder="Operations Manager"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+1-555-123-0000"
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="200 Logistics Way, Oakland, CA"
                  required
                />
              </div>
            </div>

            {/* Manufacturer Fields */}
            {form.type === "MANUFACTURER" && (
              <>
                <div>
                  <Label htmlFor="productCategoriesManufactured">
                    Product Categories (comma separated)
                  </Label>
                  <Input
                    id="productCategoriesManufactured"
                    name="productCategoriesManufactured"
                    value={form.productCategoriesManufactured}
                    onChange={handleChange}
                    placeholder="Widgets, Gadgets"
                  />
                </div>
                <div>
                  <Label htmlFor="certifications">
                    Certifications (comma separated)
                  </Label>
                  <Input
                    id="certifications"
                    name="certifications"
                    value={form.certifications}
                    onChange={handleChange}
                    placeholder="ISO9001"
                  />
                </div>
              </>
            )}

            {/* Supplier Fields */}
            {form.type === "SUPPLIER" && (
              <>
                <div>
                  <Label htmlFor="productCategoriesSupplied">
                    Supplied Categories (comma separated)
                  </Label>
                  <Input
                    id="productCategoriesSupplied"
                    name="productCategoriesSupplied"
                    value={form.productCategoriesSupplied}
                    onChange={handleChange}
                    placeholder="Steel, Aluminum"
                  />
                </div>
                <div>
                  <Label htmlFor="sourceRegions">
                    Source Regions (comma separated country codes)
                  </Label>
                  <Input
                    id="sourceRegions"
                    name="sourceRegions"
                    value={form.sourceRegions}
                    onChange={handleChange}
                    placeholder="CN, MY"
                  />
                </div>
              </>
            )}

            {/* Warehouse Fields */}
            {form.type === "WAREHOUSE" && (
              <div>
                <Label htmlFor="officeAddress">Office Address</Label>
                <Input
                  id="officeAddress"
                  name="officeAddress"
                  value={form.officeAddress}
                  onChange={handleChange}
                  placeholder="200 Logistics Way, Oakland, CA"
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
