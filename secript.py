import requests
import json


# Configuration Bunny
BUNNY_LIBRARY_ID = "722726"
BUNNY_API_KEY = "c1b74eba-864a-4daf-beb5992a3b65-e8d5-45ff"


# URL de l'API Bunny

url = f"https://video.bunnycdn.com/library/{BUNNY_LIBRARY_ID}/videos"


headers = {
    "AccessKey": BUNNY_API_KEY
}


videos = []

page = 1


while True:

    response = requests.get(
        url,
        headers=headers,
        params={
            "page": page,
            "itemsPerPage": 100
        },
        timeout=60
    )


    data = response.json()


    items = data.get("items", [])


    # Arrêter quand il n'y a plus de vidéos

    if not items:
        break


    # Ajouter les vidéos dans la liste

    for video in items:

        guid = video["guid"]


        videos.append({

            "nom": video["title"],

            "guid": guid,

            "url": f"https://iframe.mediadelivery.net/embed/{BUNNY_LIBRARY_ID}/{guid}"

        })


    print("Page récupérée :", page)


    page += 1



# Création du fichier JSON

with open(
    "client/src/videos.json",
    "w",
    encoding="utf-8"
) as fichier:


    json.dump(
        videos,
        fichier,
        ensure_ascii=False,
        indent=2
    )



print(
    "Fichier videos.json créé. Nombre total de vidéos :",
    len(videos)
)