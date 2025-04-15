# %%
import pandas as pd
import geopandas as gpd
from dotenv import load_dotenv
import os
# import geopy as gpd
from geopy.geocoders import Nominatim, GoogleV3
from shapely.geometry import Point

load_dotenv(".env",override=True)

GMAPS_API_KEY = os.getenv("GMAPS_API_KEY")

# # %%
# # Download Virginia state boundary
# # TIGER/Line 2023 state boundaries
# url = "https://www2.census.gov/geo/tiger/TIGER2023/STATE/tl_2023_us_state.zip"
# # %%

# # Load into GeoDataFrame
# states = gpd.read_file(url)
# # %%

# # Filter for Virginia
# virginia = states[states.NAME == 'Virginia']
# # %%

# # Save to local file if you want to reuse
# virginia.to_file("virginia_boundary.shp")  # or .geojson, .gpkg

# # %%
# #virginia checker function 
# def is_in_virginia(lat, lon, virginia_gdf):
#     point = Point(lon, lat)
#     return virginia_gdf.geometry.contains(point).any()

#%%
# Load the data that needs geocoding
df = pd.read_pickle('./datasets/WRMD_2014_to_2025_geocoding_req.pkl')
# %%

# Get the first rows address
test_address = df['patients.address_found'].iloc[0]
test_city = df['patients.city_found'].iloc[0]
# %%

geolocator = Nominatim(user_agent="WildVirginia")
test_location = geolocator.geocode(f'{test_address}')
# %%

gmaps_geolocator = GoogleV3(api_key=GMAPS_API_KEY, user_agent="WildVirginia")
test_location2 = gmaps_geolocator.geocode(f'{test_address}', components={'administrative_area': 'VA'})

#latidute and longitude 
latitude = test_location2.latitude
longitude = test_location2.longitude

# # %%
# # Validate that the returned geocoded location is WITHIN VA
# valitadion = is_in_virginia(latitude,longitude,virginia)