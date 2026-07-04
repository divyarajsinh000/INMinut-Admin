import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import { FiTrash2, FiRefreshCw, FiMenu } from "react-icons/fi";

const emptyCountry = { name: "", code: "" };
const emptyState = { name: "", country: "" };
const emptyCity = { name: "", country: "", state: "" };

const Locations = () => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countryForm, setCountryForm] = useState(emptyCountry);
  const [stateForm, setStateForm] = useState(emptyState);
  const [cityForm, setCityForm] = useState(emptyCity);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const [countryRes, stateRes, cityRes] = await Promise.all([
        axiosInstance.get("/locations/countries?all=true"),
        axiosInstance.get("/locations/states?all=true"),
        axiosInstance.get("/locations/cities?all=true"),
      ]);
      setCountries(countryRes.data.data || []);
      setStates(stateRes.data.data || []);
      setCities(cityRes.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const filteredStatesForCity = useMemo(() => {
    if (!cityForm.country) return states;
    return states.filter((item) => (item.country?._id || item.country) === cityForm.country);
  }, [states, cityForm.country]);

  const addCountry = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/locations/countries", countryForm);
      toast.success("Country added");
      setCountryForm(emptyCountry);
      fetchLocations();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add country");
    }
  };

  const addState = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/locations/states", stateForm);
      toast.success("State added");
      setStateForm(emptyState);
      fetchLocations();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add state");
    }
  };

  const addCity = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/locations/cities", cityForm);
      toast.success("City added");
      setCityForm(emptyCity);
      fetchLocations();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add city");
    }
  };

  const deleteItem = async (type, id) => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    try {
      await axiosInstance.delete(`/locations/${type}s/${id}`);
      toast.success(`${type} deleted`);
      fetchLocations();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to delete ${type}`);
    }
  };

  const reorderItems = async (type, orderedIds) => {
    try {
      await axiosInstance.put(`/locations/${type}s/reorder`, { orderedIds });
      toast.success(`${type} order updated`);
    } catch (error) {
      toast.error(`Failed to reorder ${type}s`);
      fetchLocations();
    }
  };

  const cardClass = "bg-white/90 rounded-[1.5rem] shadow-sm border border-red-100 p-5";
  const inputClass = "w-full border border-red-100 bg-red-50/40 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-400 font-semibold text-slate-800";

  return (
    <AdminLayout title="Locations">
      <main className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-950">Country, state and city master</h2>
            <p className="text-slate-500 font-medium mt-1">These cities power mobile preferences, news targeting and notifications.</p>
          </div>
          <button onClick={fetchLocations} className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 shadow-lg shadow-red-500/25">
            <FiRefreshCw /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <form onSubmit={addCountry} className={cardClass}>
            <h2 className="text-lg font-black text-slate-950 mb-4">Add Country</h2>
            <div className="space-y-3">
              <input required placeholder="Country name" value={countryForm.name} onChange={(e) => setCountryForm((p) => ({ ...p, name: e.target.value }))} className={inputClass} />
              <input placeholder="Code, e.g. IN" value={countryForm.code} onChange={(e) => setCountryForm((p) => ({ ...p, code: e.target.value }))} className={inputClass} />
              <button className="w-full bg-red-500 text-white py-3 rounded-2xl font-black hover:bg-red-600">Add Country</button>
            </div>
          </form>

          <form onSubmit={addState} className={cardClass}>
            <h2 className="text-lg font-black text-slate-950 mb-4">Add State</h2>
            <div className="space-y-3">
              <select required value={stateForm.country} onChange={(e) => setStateForm((p) => ({ ...p, country: e.target.value }))} className={inputClass}>
                <option value="">Select country</option>
                {countries.map((country) => <option key={country._id} value={country._id}>{country.name}</option>)}
              </select>
              <input required placeholder="State name" value={stateForm.name} onChange={(e) => setStateForm((p) => ({ ...p, name: e.target.value }))} className={inputClass} />
              <button className="w-full bg-red-500 text-white py-3 rounded-2xl font-black hover:bg-red-600">Add State</button>
            </div>
          </form>

          <form onSubmit={addCity} className={cardClass}>
            <h2 className="text-lg font-black text-slate-950 mb-4">Add City</h2>
            <div className="space-y-3">
              <select required value={cityForm.country} onChange={(e) => setCityForm((p) => ({ ...p, country: e.target.value, state: "" }))} className={inputClass}>
                <option value="">Select country</option>
                {countries.map((country) => <option key={country._id} value={country._id}>{country.name}</option>)}
              </select>
              <select required value={cityForm.state} onChange={(e) => setCityForm((p) => ({ ...p, state: e.target.value }))} className={inputClass}>
                <option value="">Select state</option>
                {filteredStatesForCity.map((state) => <option key={state._id} value={state._id}>{state.name}</option>)}
              </select>
              <input required placeholder="City name" value={cityForm.name} onChange={(e) => setCityForm((p) => ({ ...p, name: e.target.value }))} className={inputClass} />
              <button className="w-full bg-red-500 text-white py-3 rounded-2xl font-black hover:bg-red-600">Add City</button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <ListCard title="Countries" loading={loading} items={countries} setItems={setCountries} onDelete={(id) => deleteItem("countrie", id)} onReorder={(ids) => reorderItems("countrie", ids)} render={(item) => <><b>{item.name}</b><span className="text-xs text-slate-500 ml-2">{item.code}</span></>} />
          <ListCard title="States" loading={loading} items={states} setItems={setStates} onDelete={(id) => deleteItem("state", id)} onReorder={(ids) => reorderItems("state", ids)} render={(item) => <><b>{item.name}</b><p className="text-xs text-slate-500">{item.country?.name}</p></>} />
          <ListCard title="Cities" loading={loading} items={cities} setItems={setCities} onDelete={(id) => deleteItem("citie", id)} onReorder={(ids) => reorderItems("citie", ids)} render={(item) => <><b>{item.name}</b><p className="text-xs text-slate-500">{item.state?.name}, {item.country?.name}</p></>} />
        </div>
      </main>
    </AdminLayout>
  );
};

const ListCard = ({ title, loading, items, setItems, onDelete, onReorder, render }) => {
  const handleDragStart = (e, index) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index);
    setTimeout(() => { e.target.classList.add("opacity-50"); }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove("opacity-50");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (sourceIndex === targetIndex || isNaN(sourceIndex)) return;

    const newItems = [...items];
    const [movedItem] = newItems.splice(sourceIndex, 1);
    newItems.splice(targetIndex, 0, movedItem);

    setItems(newItems);
    onReorder(newItems.map((item) => item._id));
  };

  return (
    <div className="bg-white/90 rounded-[1.5rem] shadow-sm border border-red-100 overflow-hidden flex flex-col h-[560px]">
      <div className="p-5 border-b border-red-100 bg-red-50/40 shrink-0">
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
      </div>
      {loading ? <p className="p-5 text-slate-500">Loading...</p> : items.length === 0 ? <p className="p-5 text-slate-500">No records</p> : (
        <div className="divide-y divide-red-50 overflow-y-auto flex-1 custom-scrollbar">
          {items.map((item, index) => (
            <div 
              key={item._id} 
              className="p-4 flex items-center gap-3 hover:bg-red-50/40 bg-white"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-2 -ml-2">
                <FiMenu />
              </div>
              <div className="text-slate-800 flex-1 min-w-0">{render(item)}</div>
              <button onClick={() => onDelete(item._id)} className="p-2.5 bg-red-50 rounded-xl hover:bg-red-100 shrink-0"><FiTrash2 className="text-red-600" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Locations;
