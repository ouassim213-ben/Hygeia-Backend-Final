import os
import re

folder = r"c:\Users\Wassim\OneDrive\Bureau\antig\.vscode"

files = [
    'index (3).html', 'about.html', 'auth.html', 'subscription.html', 
    'home.html', 'publications.html', 'ai-tracker.html', 'appointments.html', 
    'doctor-profile.html', 'profile.html', 'app.js'
]

replacements = {
    # Navbar
    '>Accueil<': '>Home<',
    '>Publications<': '>Feed<',
    '>AI Tracker<': '>AI Tracker<',
    '>Rendez-vous<': '>Appointments<',
    '<span>RDV</span>': '<span>Appointments</span>',
    '<span>Profil</span>': '<span>Profile</span>',
    'title="Déconnexion"': 'title="Logout"',

    # Home
    'Bienvenue dans votre espace': 'Welcome to your space',
    'Votre centre de gestion complet pour une santé optimale et connectée. Explorez les services qui s\'offrent à vous.': 'Your complete hub for optimal connected health. Explore the services available to you.',
    'Quand vous voulez': 'Whenever you want',
    'Disponibilité 24/7 sur PC, tablette et mobile à la demande.': '24/7 Availability on PC, tablet, and mobile.',
    'Où vous voulez': 'Wherever you are',
    'Consultations Zoom de haute qualité depuis le confort de votre canapé.': 'High-quality Zoom consultations from the comfort of your couch.',
    'Sécurisé': 'Secure & Anonymous',
    'Paiement Stripe ultra-crypté et anonymat patient strictement garanti.': 'Encrypted Stripe payments and guaranteed patient anonymity.',
    'Utilisation simple': 'Easy to use',
    'Une interface fluide, réactive et résolument moderne (Clean UI).': 'A smooth, responsive, and modern interface.',
    'Garantie qualité': 'Quality Guaranteed',
    'L\'intégralité de nos experts sont rigoureusement certifiés par HYGEIA.': 'All our practitioners are strictly certified by HYGEIA.',
    'Information de qualité': 'Premium Insights',
    'Publications, articles et conseils exclusifs quotidiens.': 'Exclusive daily articles and health tips.',

    # Feed / Publications
    'Votre Fil d\'Actualité': 'Your Feed',
    'Quoi de neuf aujourd\'hui ?': "What's on your mind today?",
    'Partagez un progrès, une question, ou une photo de votre repas...': 'Share progress, a question, or a photo of your meal...',
    'Ajouter une photo': 'Add a photo',
    'Publier': 'Post',
    'Il y a 5 heures': '5 hours ago',
    'Il y a 12 heures': '12 hours ago',
    'J\'aime': 'Like',
    'Commentaires': 'Comments',
    'Partager': 'Share',
    'Ajouter un commentaire...': 'Add a comment...',
    'À l\'instant': 'Just now',
    'Expert Vérifié': 'Verified Expert',
    'Premier test du repas riche en protéines recommandé par mon coach ! L\'analyse par l\'IA a détecté exactement 450 Kcal. J\'adore cette appli ! 🥗🚀 #HealthJourney': 'First test of the high-protein meal recommended by my coach! The AI analysis detected exactly 450 Kcal. Loving this app! 🥗🚀 #HealthJourney',
    'Un rappel essentiel : les pics de cortisol sont plus élevés le matin. Casser votre jeûne avec des glucides rapides peut provoquer une chute brutale d\'insuline peu de temps après. Optez toujours pour une source de protéines et de bonnes graisses en premier ! 🥑🍳': 'A key reminder: cortisol spikes are highest in the morning. Breaking your fast with fast carbs can cause a sharp insulin drop shortly after. Always opt for a protein source and healthy fats first! 🥑🍳',

    # Appointments
    'Consultez nos spécialistes': 'Consult our specialists',
    'Toutes nos consultations se déroulent en visioconférence via <strong>Zoom Call</strong> pour votre plus grand confort.': 'All our consultations are held via <strong>Zoom Call</strong> for your ultimate convenience.',
    'Trouvez Votre Expert': 'Find Your Expert',
    'Sélectionnez votre spécialiste': 'Select your specialist',
    'Choisissez votre créneau': 'Choose your time slot',
    'Paiement sécurisé & Lien Zoom': 'Secure Payment & Zoom Link',
    'Voir le profil': 'View Profile',
    'Tous': 'All',
    'Diététicien': 'Dietitian',
    'Coach Sportif': 'Fitness Coach',
    'Médecin Nutritionniste': 'Nutritionist Doctor',
    'Plus de filtres': 'More filters',
    'Parcourez notre liste de professionnels certifiés pour un accompagnement sur-mesure.': 'Browse our list of certified professionals for tailored support.',
    'Diététicienne Clinique': 'Clinical Dietitian',
    'Coach Sportif Élite': 'Elite Fitness Coach',

    # Doctor Profile
    'Retour aux praticiens': 'Back to practitioners',
    '12 ans d\'expérience': '12 years of experience',
    'À propos': 'About',
    'Spécialisée dans la gestion du stress métabolique et le rééquilibrage hormonal féminin. Le Dr. Jenkins vous accompagne avec une approche scientifique holistique pour retrouver votre pleine vitalité.': 'Specialized in metabolic stress management and female hormonal balance. Dr. Jenkins supports you with a holistic scientific approach towards full vitality.',
    'Diplômes & Certifications': 'Degrees & Certifications',
    'Avis Récents': 'Recent Reviews',
    'Prendre Rendez-vous': 'Book an Appointment',
    'Consultation vidéo via Zoom': 'Video consultation via Zoom',
    'Durée : 45 minutes': 'Duration: 45 min',
    'Semaine précédente': 'Previous Week',
    'Semaine suivante': 'Next Week',
    'Avril 2026': 'April 2026',
    'Lun ': 'Mon ', 'Mar ': 'Tue ', 'Mer ': 'Wed ', 'Jeu ': 'Thu ', 'Ven ': 'Fri ', 'Sam ': 'Sat ', 'Dim ': 'Sun ',
    'Créneaux disponibles': 'Available slots',
    'Procéder au paiement (20€)': 'Proceed to payment (20€)',
    'Réserver et Payer (20€)': 'Book and Pay (20€)',
    'Procéder au paiement': 'Proceed to payment',
    'Paiement Sécurisé': 'Secure Payment',
    'Confirmez votre consultation avec le': 'Confirm your consultation with',
    'Détails de la commande': 'Order Details',
    'Consultation Vidéo - 45 min': 'Video Consultation - 45 min',
    'Nom sur la carte': 'Name on card',
    'Numéro de carte (0000 0000 ...)': 'Card number (0000 0000 ...)',
    'Confirmer le paiement': 'Confirm payment',
    'Paiement crypté par Stripe. Vos données sont protégées.': 'Payment encrypted by Stripe. Your data is protected.',
    'Rendez-vous Confirmé !': 'Appointment Confirmed!',
    'Votre paiement de 20.00€ a bien été reçu. Vous êtes officiellement programmé pour votre consultation avec le': 'Your 20.00€ payment has been successfully received. You are officially scheduled for your consultation with',
    'Lien Officiel Zoom': 'Official Zoom Link',
    'Ajouter au calendrier': 'Add to calendar',
    'Télécharger la facture': 'Download Invoice',
    'Génération du PDF...': 'Generating PDF...',
    'Facture_HYG249.pdf': 'Invoice_HYG249.pdf',
    'Vous avez sélectionné le': 'You selected',
    'Traitement de la carte...': 'Processing card...',
    'Paiement validé': 'Payment successful',
    'Lundi 06 Avril': 'Monday April 06',
    'Mardi 07 Avril': 'Tuesday April 07',
    'Mercredi 08 Avril': 'Wednesday April 08',
    'Jeudi 09 Avril': 'Thursday April 09',
    'Vendredi 10 Avril': 'Friday April 10',
    '"Très à l\'écoute. J\'ai perdu 5kg en 2 mois sans fatigue grâce à son protocole. Le suivi via Zoom est top."': '"Very attentive. I lost 5kg in 2 months with zero fatigue thanks to her protocol. The Zoom follow-ups are perfect."',

    # Subscription
    'Passez au niveau supérieur': 'Take it to the next level',
    'Débloquez tout le potentiel de votre corps avec nos outils professionnels exclusifs.': 'Unlock your body\'s full potential with our exclusive professional tools.',
    'Analyse IA Illimitée': 'Unlimited AI Analysis',
    'Ne comptez plus vos calories. Prenez vos repas en photo, notre Deep Learning fait le reste.': 'Stop counting calories. Take a photo of your meals, our Deep Learning does the rest.',
    'Consultations Zoom Privées': 'Private Zoom Consultations',
    'Accès prioritaire à notre réseau de nutritionnistes, sans frais de séance supplémentaires.': 'Priority access to our network of nutritionists, with absolutely no additional session fees.',
    'Badge Premium Exclusif': 'Exclusive Premium Badge',
    'Affichez votre statut Élite sur votre profil et débloquez la communauté restreinte du Dashboard.': 'Display your Elite status on your profile and unlock the restricted community.',
    'Sans engagement. Annulez à tout moment.': 'No commitment. Cancel anytime.',
    'Débloquer l\'accès Premium': 'Unlock Premium Access',
    '/mois': '/mo',
    'Traitement Sécurisé...': 'Securely Processing...',
    'Accès Élite Activé': 'Premium Access Activated',

    # App.js & Global Utils
    'Déconnexion réussie. À bientôt !': 'Logout successful. See you soon!',
    'Publication...': 'Posting...'
}

for root, _, filenames in os.walk(folder):
    for fn in filenames:
        if fn in files:
            path = os.path.join(root, fn)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            for fr_text, en_text in replacements.items():
                content = content.replace(fr_text, en_text)
                
            # Appointments specific step circles text color
            if fn == 'appointments.html':
                 content = content.replace(
                     'color: var(--color-primary);', 
                     'color: #000000;'
                 ).replace(
                     'color: #000000; font-size: 1.2rem; font-weight: bold; border: 4px solid var(--color-bg-light); box-shadow: var(--shadow-sm);',
                     'color: #000000; font-size: 1.2rem; font-weight: bold; border: 4px solid var(--color-bg-light); box-shadow: var(--shadow-sm);'
                 )  # A bit broad but safely applies color change. Actually let's refine:
                 c_split = content.split('width: 40px; height: 40px; background: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--color-primary)')
                 content = 'width: 40px; height: 40px; background: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #000000'.join(c_split)
                
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)

print('Translation script executed on all targets.')
