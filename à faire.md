# à faire 

- Vérifié si les articles ce génère bien tout seul une fois héberger sur le serveur (normalement à 6h tous les jours) voir dans vercel.json en modifié le 6 par une autre valeur si besoin.
- Probème avec les backlinks il dirigent pas vers un truc logique (exemple : l'ia dit regarder notre catalogue et ça mets sur la page à propos de foxy). (j'ai repoussé ce problème)
- Mettre la bonne version de phi (actuellement phi4 mais il faut phi4-mini) (ça consome moins mais le pc tourne quand même à fond donc jsp ce qu'il faudrait faire).
- Sur la page settings on peux scroll mais y a pas besoin (rapide à résoudre)
- Le scrap de l'actualité ne marche pas je pense (j'ai utilisé un flux RSS qui renvoie du XML avec le titre de l'articles récupérer sur des site CHR.)
- Le dashboard est juste mis dans un dossier admin donc accesible par tout le monde faut trouver un moyen de sécuriser.


# Commande pour forcer la génération des articles manuellement : 
http://localhost:3000/api/cron?token=foxycontent-secret-2026


# La génération des articles
Quand on lcique sur forcer la génération il y a une animation mais celle-ci se finit avant la fin de génération de l'article (l'article peut prendre jusqu'a 5 minutes)

# Nom de domaine dispo : 
chrinsight.fr
chr-insights.fr