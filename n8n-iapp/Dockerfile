FROM n8nio/n8n:latest

USER root

# Copier les fichiers de configuration du projet
COPY package*.json /app/
COPY src/ /app/src/

# Installer les dépendances du projet
WORKDIR /app
RUN npm ci --only=production

# Copier le script d'entrée et le rendre executable
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Créer les répertoires nécessaires pour iExec
RUN mkdir -p /iexec_in /iexec_out

# Définir les variables d'environnement pour iExec
ENV IEXEC_IN=/iexec_in
ENV IEXEC_OUT=/iexec_out

ENTRYPOINT ["/entrypoint.sh"]