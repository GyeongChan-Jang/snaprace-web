import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  eventId: '98041',
  subEventId: '242107',
  eventUniqueCode: 'qyqqnssgsukgp7uh',
  limit: 1000,
  outputDir: path.join(__dirname, 'raceroster'),
  outputFile: path.join(__dirname, 'raceroster', '5k.json')
};

// Ensure output directory exists
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

// Function to fetch leaderboard data
async function fetchLeaderboard() {
  const url = `https://results.raceroster.com/v2/api/result-events/${CONFIG.eventId}/sub-events/${CONFIG.subEventId}/results?filter_search=&limit=${CONFIG.limit}`;

  console.log(`Fetching leaderboard from: ${url}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Fetched ${data.data?.length || 0} participants from leaderboard`);
    return data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error.message);
    throw error;
  }
}

// Function to fetch participant details
async function fetchParticipantDetail(participantId, eventUniqueCode) {
  const url = `https://results.raceroster.com/v2/api/events/${eventUniqueCode}/detail/${participantId}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Warning: Failed to fetch details for participant ${participantId}: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn(`Warning: Error fetching details for participant ${participantId}:`, error.message);
    return null;
  }
}

// Function to fetch all participant details with rate limiting
async function fetchAllParticipantDetails(participants, eventUniqueCode) {
  const details = [];
  const totalParticipants = participants.length;

  console.log(`Fetching details for ${totalParticipants} participants...`);

  // Process participants in batches to avoid overwhelming the API
  const batchSize = 10; // 10 concurrent requests
  const delayBetweenBatches = 1000; // 1 second delay between batches

  for (let i = 0; i < totalParticipants; i += batchSize) {
    const batch = participants.slice(i, i + batchSize);
    const batchPromises = batch.map(async (participant, index) => {
      const globalIndex = i + index;
      console.log(`Fetching details for participant ${globalIndex + 1}/${totalParticipants}: ${participant.name}`);

      const detailData = await fetchParticipantDetail(participant.id, eventUniqueCode);

      // Add delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));

      // Include the participant ID for mapping
      if (detailData) {
        detailData.participantId = participant.id;
      }

      return detailData;
    });

    const batchResults = await Promise.all(batchPromises);
    details.push(...batchResults.filter(detail => detail !== null));

    console.log(`Completed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(totalParticipants / batchSize)}`);

    // Delay between batches
    if (i + batchSize < totalParticipants) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }

  console.log(`Successfully fetched details for ${details.length} participants`);
  return details;
}

// Function to convert detailed participant data to mock format
function convertToMockFormat(leaderboardData, participantDetails) {
  console.log('Converting data to mock format...');

  // Create a map of participant ID to details for quick lookup
  const detailMap = new Map();
  participantDetails.forEach(detail => {
    if (detail && detail.data && detail.data.result) {
      // Store the participant data using the URL parameter ID as key
      // We need to extract the participant ID from the API call context
      detailMap.set(detail.participantId, detail.data);
    }
  });

  const results = leaderboardData.data.map((participant, index) => {
    const overallPlace = index + 1;
    const detail = detailMap.get(participant.id);

    // Use detail data if available, otherwise fall back to leaderboard data
    const name = detail?.result?.name || participant.name || '';
    const gender = detail?.result?.gender === 'Male' ? 'M' : (detail?.result?.gender === 'Female' ? 'F' : '');
    const age = detail?.result?.age || '';
    const city = detail?.result?.fromCity || participant.fromCity || '';
    const state = detail?.result?.fromProvState || participant.fromProvState || '';
    const chipTime = detail?.result?.chipTime || participant.chipTime || '';
    const pace = detail?.result?.overallPace || participant.overallPace || '';
    const division = detail?.result?.division || participant.division || '';
    const divisionPlace = detail?.result?.divisionPlaceLabel || participant.divisionPlace || '';
    const bib = detail?.result?.bib || '';
    const countryCode = detail?.result?.fromCountry || participant.fromCountry || '';

    // Extract division place number - handle empty divisionPlace
    let divisionPlaceNum = '';
    if (divisionPlace && divisionPlace.includes(' / ')) {
      divisionPlaceNum = divisionPlace.split(' / ')[0];
    }

    return [
      overallPlace,                                    // race_placement
      bib,                                             // bib_num
      name,                                            // name
      '',                                              // profile_image_url (empty for now)
      gender,                                          // gender
      age,                                             // age
      city,                                            // city
      state,                                           // state
      countryCode,                                     // countrycode
      detail?.result?.gunTime || '',                   // clock_time
      chipTime,                                        // chip_time
      pace,                                            // avg_pace
      '',                                              // age_performance_percentage (empty)
      divisionPlaceNum,                                // division_place
      division,                                        // division
      ''                                               // field_475549 (GENPLC - empty)
    ];
  });

  // Define headings matching the existing format
  const headings = [
    {
      "key": "race_placement",
      "name": "Place",
      "style": "place",
      "hidden": false
    },
    {
      "key": "bib_num",
      "name": "Bib",
      "style": "bib",
      "hidden": false
    },
    {
      "key": "name",
      "name": "Name",
      "hidden": false
    },
    {
      "key": "profile_image_url",
      "name": "Profile Image URL",
      "hidden": true
    },
    {
      "key": "gender",
      "name": "Gender",
      "hidden": false
    },
    {
      "key": "age",
      "name": "Age",
      "hidden": false
    },
    {
      "key": "city",
      "name": "City",
      "hidden": false
    },
    {
      "key": "state",
      "name": "State",
      "hidden": false
    },
    {
      "key": "countrycode",
      "name": "Country",
      "hidden": true
    },
    {
      "key": "clock_time",
      "name": "Clock\nTime",
      "style": "time",
      "hidden": false
    },
    {
      "key": "chip_time",
      "name": "Chip\nTime",
      "style": "time",
      "hidden": false
    },
    {
      "key": "avg_pace",
      "name": "Pace",
      "style": "time",
      "hidden": false
    },
    {
      "key": "age_performance_percentage",
      "tooltip": "This shows how well you performed based on your age.  Higher numbers are better, with 100% being the best.",
      "name": "Age\nPercentage",
      "hidden": true
    },
    {
      "key": "division_place",
      "nonSortable": true,
      "name": "Division\nPlace",
      "style": "place",
      "hidden": false
    },
    {
      "key": "division",
      "nonSortable": true,
      "name": "Division",
      "hidden": false
    },
    {
      "key": "field_475549",
      "sortKey": "field_475549_value",
      "name": "GENPLC",
      "hidden": false
    }
  ];

  // Create division information based on the data
  const uniqueDivisions = [...new Set(results.map(r => r[14]))]; // division field
  const divisions = uniqueDivisions.map((divName, index) => ({
    race_division_id: 6382710 + index,
    division_name: divName,
    division_short_name: divName,
    show_top_num: 5,
    gender: null,
    max_age: null,
    min_age: null,
    individual_result_set_id: null
  }));

  // Create the mock data structure
  return {
    headings: headings,
    resultSet: {
      extraFieldIds: [475549],
      results: results,
      extraFields: {
        "475549": {
          individual_result_extra_field_id: 475549,
          individual_result_set_id: 503106,
          field_name: "GENPLC",
          field_short_name: "GENPLC",
          field_type: "U",
          individual_result_extra_field_deleted: "F"
        }
      },
      divisionGroups: [],
      nonGroupedDivisionIds: divisions.map(d => d.race_division_id),
      splits: [],
      numResults: results.length,
      setInfo: {
        individual_result_set_id: 503106,
        race_category_id: 893971,
        individual_result_set_deleted: "F",
        individual_result_set_name: "2024 - 5K Race",
        public_results: "T",
        disable_division_placement_calc: "F",
        results_source_name: "Race Roster API",
        results_source_url: null,
        result_questions_url: null,
        preliminary_results: "F",
        pace_type: "T",
        hide_splits_in_results: "F",
        hide_event_names: "F",
        disable_result_set_notifications: "F",
        sort_order: 0,
        tally_field_type: 0,
        tally_label: null,
        tally_higher_is_better: "T",
        team_column_display_type: 1,
        hide_award_winner_section: "F"
      }
    },
    resultUrls: [],
    auxData: {
      rowFirstNameLens: results.map(r => r[2] ? r[2].split(' ')[0].length : 0)
    },
    teamResultSetId: null,
    overallDivisionResults: [],
    divisions: divisions,
    divisionResults: {},
    videoSettings: {
      finishLine: null
    },
    raceGroupMarkdownUrls: []
  };
}

// Main execution function
async function main() {
  console.log('Starting RaceRoster data fetch...');
  console.log(`Event ID: ${CONFIG.eventId}, Sub-event ID: ${CONFIG.subEventId}`);

  try {
    // Step 1: Fetch leaderboard data
    const leaderboardData = await fetchLeaderboard();

    if (!leaderboardData || !leaderboardData.data || leaderboardData.data.length === 0) {
      throw new Error('No participant data found in leaderboard');
    }

    console.log(`Found ${leaderboardData.data.length} participants in leaderboard`);

    // Step 2: Fetch participant details
    const participantDetails = await fetchAllParticipantDetails(
      leaderboardData.data,
      CONFIG.eventUniqueCode
    );

    // Step 3: Convert to mock format
    const mockData = convertToMockFormat(leaderboardData, participantDetails);

    // Step 4: Save to file
    console.log(`Saving data to: ${CONFIG.outputFile}`);
    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(mockData, null, 2));

    console.log('✅ Success!');
    console.log(`- Processed ${mockData.resultSet.numResults} participants`);
    console.log(`- Created ${mockData.divisions.length} divisions`);
    console.log(`- Output file: ${CONFIG.outputFile}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();