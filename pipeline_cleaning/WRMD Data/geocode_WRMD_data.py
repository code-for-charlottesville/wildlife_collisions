# %%
import pandas as pd
import geopy
from geopy.geocoders import Nominatim
# %%

# Load the data that needs geocoding
df = pd.read_pickle('./datasets/WRMD_2014_to_2025_geocoding_req.pkl')
# %%

# Get the first rows address
test_address = df['patients.address_found'].iloc[0]
test_city = df['patients.city_found'].iloc[0]
# %%

geolocator = Nominatim(user_agent="WildVirginia")
test_location = geolocator.geocode(f'{test_address}, {test_city}')
# %%

# Validate that the returned geocoded location is WITHIN VA