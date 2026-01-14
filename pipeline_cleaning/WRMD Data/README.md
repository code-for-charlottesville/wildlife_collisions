# WRMD Data - Wildlife Vehicle Collision Pipeline

## Overview

This directory contains data processing pipelines for Wildlife Rehabilitation MD (WRMD) patient medical records, focused on identifying and analyzing vehicle collision incidents with wildlife in Virginia. The data is sourced from [WRMD](https://www.wrmd.org/), a comprehensive wildlife rehabilitation database used by rehabilitation centers across North America.

The pipeline processes WRMD records from 2014-2025, filters for vehicle collision cases, geocodes addresses, validates geolocation data, and transforms the data into a standardized format for wildlife hotspot analysis and mapping.

---

## Directory Structure

```
WRMD Data/
├── datasets/                          # Processed data files (pickles, CSV, shapefiles)
│   ├── WRMD_2016_to_2024_all_cols.xlsx                          # Raw WRMD export with all columns
│   ├── patient-medical-records-2024.xlsx                        # Additional 2024 patient records
│   ├── WRMD_2014_to_2025_geocoding_req.pkl                      # Records requiring geocoding (have addresses, missing lat/lng)
│   ├── WRMD_2014_to_2025_geocoded_v1.pkl                        # Geocoded results from Google Maps API
│   ├── WRMD_2016_to_2024_all_cols_geocoding_not_req.pkl        # Records with existing coordinates (cleaned)
│   ├── WRMD_2016_to_2024_inside_va_geocoding_not_required.pkl  # Final dataset: VA records with valid coordinates
│   ├── WRMD_2016_to_2024_geocoding_not_req_transformed.csv     # Final transformed dataset ready for analysis
│   ├── cb_2018_us_state_20m/         # US state boundaries shapefile (for Virginia filtering)
│   └── cb_2018_51_bg_500k/           # Virginia block group shapefile
│
├── lookup_tables/                    # Reference data for species mapping
│   ├── AnimalsCategorized.csv        # Maps common species names to vertebrate categories (Bird/Mammal/Reptile/Amphibian)
│   └── CollisionAnimalMapping.csv    # Maps specific species to general categories (e.g., "red-tailed hawk" → "bird")
│
├── exploration/                      # Exploratory analysis notebooks
│   ├── WRMD_data_profiling.ipynb     # Data quality and distribution analysis
│   └── WRMD_rows_outside_Virginia.ipynb  # Analysis of non-Virginia records
│
├── WRMD_data_pipeline.ipynb          # Main data cleaning and filtering pipeline
├── geocode_WRMD_data.py              # Geocoding script using Google Maps API
├── WRMD_data_schema_mapping.ipynb    # Data transformation to standardized schema
│
├── .env                              # API credentials (DO NOT COMMIT)
├── sample.env                        # Template for .env file
└── README.md                         # This file
```

---

## Pipeline Workflow

### 1. Data Import and Initial Cleaning
**File:** [WRMD_data_pipeline.ipynb](WRMD_data_pipeline.ipynb)

**Input:** `WRMD_2016_to_2024_all_cols.xlsx`

**Steps:**
- Load raw WRMD patient medical records (25,100 rows, 95 columns)
- Remove records with no geolocation information (no address AND no lat/lng)
- Clean invalid address entries (non-numeric prefixes like "ss", "unknown", "x", numeric-only values)
- Filter for vehicle collision cases using multiple criteria:
  - **Keywords column:** "HBV" (Hit by Vehicle)
  - **Diagnosis column:** "H - Hit by Vehicle" and variations
  - **Reasons for admission:** "vehicle", "HBV", "HBC", "collision", "car" (with word boundary matching)
- Results: 3,049 vehicle collision records identified

### 2. Split by Geocoding Requirements

**Geocoding Required (1,936 records):**
- Records with addresses but missing lat/lng coordinates
- Output: `WRMD_2014_to_2025_geocoding_req.pkl`

**Geocoding NOT Required (1,113 records):**
- Records with existing lat/lng coordinates
- Require data quality fixes (see step 3)
- Output: `WRMD_2016_to_2024_all_cols_geocoding_not_req.pkl`

### 3. Fix Coordinate Data Quality Issues
**File:** [WRMD_data_pipeline.ipynb](WRMD_data_pipeline.ipynb)

For records with existing coordinates, apply several systematic corrections:

**A. Misplaced Decimal Points**
- Example: `-78033331.0` → `-78.033331` (latitude values outside valid range)
- Systematically divide by powers of 10 (100, 1000, 10000) to bring values into valid ranges
- Valid ranges: Latitude [-90, 90], Longitude [-180, 180]

**B. Swapped Latitude/Longitude**
- Identifies records where lat/lng are reversed (e.g., negative lat, positive lng)
- Uses Mid-Atlantic region bounds to detect swaps:
  - Expected: positive latitude (35-42°N), negative longitude (-85 to -74°W)
- Swaps values to correct positions
- 393 records corrected

**C. Incorrect Longitude Sign**
- Ensures all longitude values are negative (Western Hemisphere)
- 12 records corrected

### 4. Geographic Filtering (Virginia Boundary Check)
**File:** [WRMD_data_pipeline.ipynb](WRMD_data_pipeline.ipynb)

**Process:**
- Load Virginia state shapefile (`cb_2018_us_state_20m/`)
- Create 25-mile buffer zone around Virginia borders (40,233.6 meters)
- Perform spatial join to identify records within Virginia + buffer
- Separate records inside vs. outside Virginia

**Output:**
- Inside Virginia: `WRMD_2016_to_2024_inside_va_geocoding_not_required.pkl` (1,093 records)
- Outside Virginia: Flagged for review

### 5. Geocoding Addresses
**File:** [geocode_WRMD_data.py](geocode_WRMD_data.py)

**Status:** ⚠️ UNFINISHED - Requires further refinement

**Process:**
- Uses Google Maps Geocoding API with US/VA/WV/NC geographic restrictions
- Processes addresses in chunks to manage API rate limits (default: 5 addresses per batch)
- Validates geocoding results:
  - Filters for `street_address` type results (ensures location precision)
  - Verifies state matches expected regions
  - Handles out-of-state results and low-precision geocodes

**API Configuration:**
- Rate limiting: 1 second minimum delay between requests
- Location restrictions: Virginia, West Virginia, North Carolina
- Combines address + city for better geocoding accuracy

**Output:** `WRMD_2014_to_2025_geocoded_v1.pkl`

### 6. Data Transformation to Standard Schema
**File:** [WRMD_data_schema_mapping.ipynb](WRMD_data_schema_mapping.ipynb)

**Input:** `WRMD_2016_to_2024_inside_va_geocoding_not_required.pkl`

Transforms WRMD data to match WCV (Wildlife Center of Virginia) schema for data integration:

| Target Column | Source/Calculation | Description |
|---------------|-------------------|-------------|
| `OrganizationName` | Constant "WRMD" | Data source identifier |
| `Case Number` | `WRMD{year}-{admission_id}` | Unique case identifier (e.g., "WRMD2016-1") |
| `PatientID` | NULL | Placeholder for internal IDs |
| `CommonSpeciesName` | `patients.common_name` (lowercase) | Species common name |
| `GeneralSpeciesName` | Lookup from `CollisionAnimalMapping.csv` | Grouped category (e.g., "turtle", "bird") |
| `Vertebrate` | Lookup from `AnimalsCategorized.csv` | Vertebrate class (Bird/Mammal/Reptile/Amphibian) |
| `DateAdmitted` | `patients.admitted_at` (MM/DD/YYYY) | Admission date |
| `DateAdmittedYear` | Extracted from `patients.admitted_at` | Admission year |
| `Season` | Calculated from admission date | Winter/Spring/Summer/Autumn |
| `DateAdmittedMonth` | Month name from admission date | Full month name |
| `DateAdmittedDOM` | Day number from admission date | Day of month (1-31) |
| `DateAdmittedDOW` | Day name from admission date | Full day name |
| `Latitude` | `patients.lat_found` | Geographic coordinate |
| `Longitude` | `patients.lng_found` | Geographic coordinate |
| `Disposition` | Normalized `patients.disposition` | Unified: Active/Died/Released/Transferred |
| `UpdatedDisposition` | Same as `Disposition` | Legacy field |
| `DayOfWeekNumber` | Numeric day of week (0=Mon) | Day number |
| `MonthNumber` | Month number (1-12) | Numeric month |

**Season Calculation:**
- Winter: Dec 22 - Mar 20
- Spring: Mar 21 - Jun 20
- Summer: Jun 21 - Sep 22
- Autumn: Sep 23 - Dec 21

**Disposition Mapping:**
- "died", "euthanized", "dead" → "Died"
- "released" → "Released"
- "transferred" → "Transferred"
- "pending" → "Active"

**Output:** `WRMD_2016_to_2024_geocoding_not_req_transformed.csv` (1,093 records, 18 columns)

---

## Key Outputs

### Final Dataset for Analysis
**File:** [datasets/WRMD_2016_to_2024_geocoding_not_req_transformed.csv](datasets/WRMD_2016_to_2024_geocoding_not_req_transformed.csv)

**Contents:**
- 1,093 vehicle collision records
- Virginia locations only (with 25-mile buffer)
- Validated geolocation coordinates
- Standardized schema compatible with WCV data
- Ready for ArcGIS mapping and hotspot analysis

**Coverage:**
- Date range: 2016-2024
- Geographic scope: Virginia + 25-mile buffer zone
- Focus: Wildlife-vehicle collisions

### Intermediate Datasets

| File | Records | Description |
|------|---------|-------------|
| `WRMD_2014_to_2025_geocoding_req.pkl` | 1,936 | Needs geocoding (has address, no coordinates) |
| `WRMD_2014_to_2025_geocoded_v1.pkl` | 1,936 | Geocoding results (quality checks needed) |
| `WRMD_2016_to_2024_all_cols_geocoding_not_req.pkl` | 1,113 | Has coordinates, cleaned and corrected |
| `WRMD_2016_to_2024_inside_va_geocoding_not_required.pkl` | 1,093 | Final VA records with valid coordinates |

---

## Setup Instructions

### 1. Install Dependencies

```bash
pip install pandas geopandas geopy googlemaps python-dotenv shapely folium
```

### 2. Configure API Keys

Copy the sample environment file and add your Google Maps API key:

```bash
cp sample.env .env
```

Edit `.env` and replace with your actual API key:
```
GOOGLE_API_KEY=your_actual_api_key_here
```

**Note:** The `.env` file is gitignored to protect your credentials. Never commit API keys to version control.

### 3. Obtain Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Geocoding API**
4. Create credentials (API Key)
5. Set up billing (geocoding requires a billing account, but includes free tier)
6. (Optional) Restrict API key to Geocoding API and specific domains

---

## Data Quality Notes

### Known Issues

1. **Geocoding Incompleteness** (⚠️)
   - `geocode_WRMD_data.py` is functional but requires further refinement
   - Some addresses may geocode outside Virginia despite geographic restrictions
   - Low-precision results (city-level vs. street-level) need manual review

2. **Out-of-State Records**
   - Some records fall outside Virginia boundaries
   - Analysis in [exploration/WRMD_rows_outside_Virginia.ipynb](exploration/WRMD_rows_outside_Virginia.ipynb)
   - May represent animals transported from neighboring states

3. **Missing Data**
   - Some records lack precise addresses (e.g., "found on roadside")
   - Excluded from final dataset if no lat/lng can be determined

### Data Validation Checks

The pipeline includes several assertion checks:
- All latitude values in range [-90, 90]
- All longitude values in range [-180, 180]
- All longitude values negative (Western Hemisphere)
- No incomplete coordinate pairs (lat without lng or vice versa)
- All species names exist in lookup tables
- Valid disposition values only (Active/Died/Released/Transferred)
- Valid seasons only (Winter/Spring/Summer/Autumn)

---

## Lookup Tables

### AnimalsCategorized.csv
Maps 149 common species names to vertebrate categories:
- **Purpose:** Categorize species for analysis grouping
- **Format:** `CommonSpeciesName, DVertebrate`
- **Categories:** Bird, Mammal, Reptile, Amphibian
- **Example:** "Red-tailed Hawk" → "Bird", "Virginia Opossum" → "Mammal"

### CollisionAnimalMapping.csv
Maps 146 species to general animal types:
- **Purpose:** Further grouping for collision analysis
- **Format:** `Animal, Mapping`
- **Examples:**
  - "red-tailed hawk" → "bird"
  - "eastern box turtle" → "turtle"
  - "virginia opossum" → "marsupial"
  - "striped skunk" → "skunk"
  - "woodchuck" → "rodent"

---

## Usage Examples

### Running the Full Pipeline

1. **Clean and filter raw data:**
   ```bash
   jupyter notebook WRMD_data_pipeline.ipynb
   ```
   Run all cells to process raw WRMD data, identify vehicle collisions, and fix coordinate issues.

2. **Geocode addresses (if needed):**
   ```python
   python geocode_WRMD_data.py
   ```
   Note: Edit the script to adjust chunk size and processing range.

3. **Transform to standard schema:**
   ```bash
   jupyter notebook WRMD_data_schema_mapping.ipynb
   ```
   Run all cells to produce final CSV output.

### Loading Processed Data

```python
import pandas as pd

# Load final transformed data
df = pd.read_csv('./datasets/WRMD_2016_to_2024_geocoding_not_req_transformed.csv')

# Or load intermediate pickle files
import geopandas as gpd
gdf = gpd.read_pickle('./datasets/WRMD_2016_to_2024_inside_va_geocoding_not_required.pkl')
```

---

## Next Steps

1. **Complete Geocoding Pipeline**
   - Refine `geocode_WRMD_data.py` to handle edge cases
   - Implement quality checks for geocoding precision
   - Merge geocoded results with existing coordinate data

2. **Data Integration**
   - Combine WRMD data with WCV WildOne database
   - Verify schema compatibility
   - Resolve duplicate records (if any)

3. **Hotspot Analysis**
   - Import final CSV into ArcGIS or QGIS
   - Perform kernel density estimation for collision hotspots
   - Overlay with road networks and habitat data
   - Identify high-risk areas for wildlife-vehicle conflicts

4. **Temporal Analysis**
   - Analyze seasonal patterns in collisions
   - Identify time-of-day trends (if time data available)
   - Examine year-over-year changes

---

## Contact & Support

For questions about WRMD data or this pipeline:

- **WRMD Platform:** https://www.wrmd.org/
- **Data Source:** Wildlife rehabilitation centers using WRMD database
- **Pipeline Issues:** Contact project maintainer

---

## License & Attribution

When using this data or pipeline, please cite:

- **Data Source:** Wildlife Rehabilitation MD (WRMD) - https://www.wrmd.org/
- **Geographic Data:** U.S. Census Bureau TIGER/Line Shapefiles (2018)

---

## Changelog

### Version 1.0 (Current)
- Initial pipeline implementation
- Vehicle collision filtering (3 criteria sources)
- Coordinate quality fixes (decimal points, swaps, signs)
- Geographic filtering (Virginia + 25-mile buffer)
- Schema transformation to WCV standard
- Output: 1,093 validated Virginia vehicle collision records (2016-2024)

### Known Limitations
- Geocoding pipeline requires refinement
- ~1,936 records still need geocoding
- Manual review needed for out-of-state results
- Time-of-day data not consistently available
