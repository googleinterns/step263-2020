// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps.servlets;

import com.google.appengine.api.datastore.*;
import com.google.gson.Gson;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

// Enum of the charts available.
enum Chart {
    ANIMALS_REPORTED,
    TOP_REPORTERS,
    USERS_STATE
}

/** Returns data to be displayed by charts */
@WebServlet("/charts")
public class ChartsServlet extends HttpServlet {

    /** Responds with the data relevant for the different charts. */
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

        // Data for the 'animals reported' chart
        Projection animalProjection = new PropertyProjection("animal", String.class);
        Query queryAnimalNames = new Query("Marker").addProjection(animalProjection);
        List<Entity> animalList = datastore.prepare(queryAnimalNames).asList(FetchOptions.Builder.withDefaults());
        // If no reports have been made - set the response to be an empty object.
        if(animalList.isEmpty()) {
            response.getWriter().println("{}");
            return;
        }
        Map<String, Integer> animalCounters = countOccurrences(animalList, "animal");
        Map<String, Integer> topTenAnimals = getMostFrequent(animalCounters, 10);
        int sumAllAnimals = animalCounters.values().stream().reduce(0, Integer::sum);
        int sumFrequentAnimals = topTenAnimals.values().stream().reduce(0, Integer::sum);
        int sumOtherAnimals = sumAllAnimals - sumFrequentAnimals;
        topTenAnimals.put("other", sumOtherAnimals);

        // Data for the 'top 5 reporters' chart
        Projection userIdProjection = new PropertyProjection("userId", String.class);
        Projection reporterProjection = new PropertyProjection("reporter", String.class);
        Query queryUsers = new Query("Marker").addProjection(userIdProjection).addProjection(reporterProjection);
        List<Entity> usersList = datastore.prepare(queryUsers).asList(FetchOptions.Builder.withDefaults());
        Map<String, Integer> userCounters = countOccurrences(usersList, "userId");
        Map<String, Integer> topFiveIds = getMostFrequent(userCounters, 5);
        Map<String, Integer> topFiveReporters = getUsersFromIds(topFiveIds, usersList);

        // Data for the 'users state' chart
        Map<String, Integer> usersState = new HashMap<>();
        int sumReportsByUsers = userCounters.values().stream().reduce(0, Integer::sum);
        int sumGuestReporters = sumAllAnimals - sumReportsByUsers;
        usersState.put("logged-in reporters", sumReportsByUsers);
        usersState.put("guest reporters", sumGuestReporters );

        List<Map<String, Integer>> resultList = new ArrayList<>();
        resultList.add(Chart.ANIMALS_REPORTED.ordinal(), topTenAnimals);
        resultList.add(Chart.TOP_REPORTERS.ordinal(), topFiveReporters);
        resultList.add(Chart.USERS_STATE.ordinal(), usersState);
        Gson gson = new Gson();
        String jsonResponse = gson.toJson(resultList);

        response.getWriter().println(jsonResponse);
    }

    // Counts the occurrences of the items in the list
    private static Map<String, Integer> countOccurrences(List<Entity> queryResultList, String propertyName) {
        Map<String, Integer> countersMap = new HashMap<>();
        for (Entity entity : queryResultList) {
            String instanceKey = (String) entity.getProperty(propertyName);
            Integer instanceCounter = countersMap.get(instanceKey.toLowerCase());
            countersMap.put(instanceKey.toLowerCase(), (instanceCounter == null) ? 1 : instanceCounter + 1);
        }
        return  countersMap;
    }

    // Returns a map that contains the k highest values of a given map.
    private static Map<String, Integer> getMostFrequent(Map<String, Integer> countersMap, int k) {
        Map<String, Integer> result = countersMap.entrySet().stream()
                .sorted(Map.Entry.comparingByValue(Comparator.reverseOrder()))
                .limit(k)
                .collect(Collectors.toMap(
                        Map.Entry::getKey, Map.Entry::getValue, (e1, e2) -> e1, LinkedHashMap::new));

        return result;
    }

    // Receives a map that maps num. of reports to user IDs and returns the same map but with the user's name instead of the ID.
    private static Map<String, Integer>  getUsersFromIds(Map<String, Integer> idsMap, List<Entity> queryResultList) {
        // Create a map to get a user's name from his ID
        Map<String, String> idToNameMap = new HashMap<>();
        for (Entity entity : queryResultList) {
            String userId = (String) entity.getProperty("userId");
            String reporter = idToNameMap.get(userId);
            // Since the user can choose a different name in each report, we display the name he used in his first report.
            if (reporter == null) {
                idToNameMap.put(userId, (String)entity.getProperty("reporter"));
            }
        }

        Map<String, Integer> reportersMap = new HashMap<>();
        // For each user ID in the top 5 IDs map - get the corresponding reporter's name
        for(Map.Entry<String, Integer> entry : idsMap.entrySet()) {
            reportersMap.put(idToNameMap.get(entry.getKey()), entry.getValue());
        }
        return reportersMap;
    }
}
