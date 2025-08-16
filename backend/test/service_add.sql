INSERT INTO gov_service_categories (
    category_si, category_en, category_ta,
    description_si, description_en, description_ta,
    created_at
) VALUES
(
    'අධ්‍යාපන සේවා', 'education services', 'கல்வி சேவைகள்',
    'අධ්‍යාපන හා අධ්‍යාපන ආයතන සම්බන්ධ සේවාවන්', 'Services related to education and learning institutions', 'கல்வி மற்றும் கற்றல் நிறுவனங்களுடன் தொடர்புடைய சேவைகள்',
    CURRENT_TIMESTAMP
),
(
    'සෞඛ්‍ය සේවා', 'health services', 'ஆரோக்கிய சேவைகள்',
    'සෞඛ්‍ය හා වෛද්‍ය පහසුකම් සම්බන්ධ සේවාවන්', 'Services related to healthcare and medical facilities', 'ஆரோக்கிய மற்றும் மருத்துவ வசதிகளுடன் தொடர்புடைய சேவைகள்',
    CURRENT_TIMESTAMP
),
(
    'පානවල සේවා', 'civil services', 'சிவில் சேவைகள்',
    'පුරවැසියාගේ මූලික ආධාර සහ පරිපාලන සේවාවන්', 'Civil services including essential citizen documentation and administration', 'அரசியல் சேவைகள், அடிப்படைக் குடிமக்கள் ஆவணங்கள் மற்றும் நிர்வாகம் உட்பட',
    CURRENT_TIMESTAMP
),
(
    'ආරක්ෂක සේවා', 'security services', 'பாதுகாப்பு சேவைகள்',
    'පොලිස් හා හදිසි සේවා ඇතුළු ආරක්ෂක සේවාවන්', 'Public safety and security services including police and emergency services', 'பாதுகாப்பு மற்றும் காவல் சேவைகள் உட்பட பொதுச் சுகாதார சேவைகள்',
    CURRENT_TIMESTAMP
),
(
    'ප්‍රවාහන සේවා', 'transport services', 'போக்குவரத்து சேவைகள்',
    'ප්‍රවාහන හා යාත්‍රා පහසුකම් සම්බන්ධ සේවාවන්', 'Transportation services including public transit and infrastructure', 'போக்குவரத்து மற்றும் பொது போக்குவரத்து வசதிகள் உட்பட சேவைகள்',
    CURRENT_TIMESTAMP
);
