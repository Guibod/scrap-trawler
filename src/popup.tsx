import { useState, useEffect } from "react";

const Popup = () => {
  const [urlList, setUrlList] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState("");

  // Charger les URLs à partir du stockage local lors du chargement du popup
  useEffect(() => {
    chrome.storage.local.get("urlsToScrape", (data) => {
      if (data.urlsToScrape) {
        setUrlList(data.urlsToScrape);
      }
    });
  }, []);

  // Ajouter une nouvelle URL à la liste
  const handleAddUrl = () => {
    if (newUrl) {
      setUrlList((prevList) => [...prevList, newUrl]);
      setNewUrl("");
      chrome.storage.local.set({
        urlsToScrape: [...urlList, newUrl],
      });
    }
  };

  // Lancer le scraping (envoyer un message au background)
  const startScraping = () => {
    chrome.runtime.sendMessage({ type: "startScraping" });
  };

  return (
    <div>
      <h1>Définir les pages à scraper</h1>
      <input
        type="text"
        value={newUrl}
        onChange={(e) => setNewUrl(e.target.value)}
        placeholder="Ajouter une URL"
      />
      <button onClick={handleAddUrl}>Ajouter</button>

      <h2>Liste des pages à scraper</h2>
      <ul>
        {urlList.map((url, index) => (
          <li key={index}>{url}</li>
        ))}
      </ul>

      <button onClick={startScraping}>Lancer le scraping</button>
    </div>
  );
};

export default Popup;
