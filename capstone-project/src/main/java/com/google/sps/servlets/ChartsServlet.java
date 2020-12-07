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

/** Returns data to be displayed by charts */
@WebServlet("/charts")
public class ChartsServlet extends HttpServlet {

    /** Responds with the data relevant for the different charts. */
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

        Projection animalProjection = new PropertyProjection("animal", String.class);
        Query queryAnimalNames = new Query("Marker").addProjection(animalProjection);
        List<Entity> animalList = datastore.prepare(queryAnimalNames).asList(FetchOptions.Builder.withDefaults());
        if(animalList.isEmpty()) {
            response.getWriter().println("");
            return;
        }
        Map<String, Integer> animalCounters = countInstances(animalList, "animal");
        Map<String, Integer> topTenAnimals = getMostFrequent(animalCounters, 10);
        int sumAllReports = animalCounters.values().stream().reduce(0, Integer::sum);
        int sumFrequentReports = topTenAnimals.values().stream().reduce(0, Integer::sum);
        int unFrequentResults = sumAllReports - sumFrequentReports;
        topTenAnimals.put("Other", unFrequentResults);

        Projection userProjection = new PropertyProjection("userId", String.class);
        Query queryUserIds = new Query("Marker").addProjection(userProjection);
        List<Entity> userIdsList = datastore.prepare(queryUserIds).asList(FetchOptions.Builder.withDefaults());
        Map<String, Integer> userCounters = countInstances(userIdsList, "userId");
        Map<String, Integer> topFiveReporters = getMostFrequent(userCounters, 5);

        Map<String, Integer> usersState = new HashMap<>();
        int sumReportsByUsers = userCounters.values().stream().reduce(0, Integer::sum);
        usersState.put("Logged-in reporters", sumReportsByUsers);
        usersState.put("Guest reporters", sumAllReports - sumReportsByUsers);

        List<Map<String, Integer>> resultList = new ArrayList<>();
        resultList.add(topTenAnimals);
        resultList.add(topFiveReporters);
        resultList.add(usersState);
        Gson gson = new Gson();
        String jsonResponse = gson.toJson(resultList);
        response.getWriter().println(jsonResponse);
    }

    private Map<String, Integer> countInstances(List<Entity> queryResultList, String propertyName) {
        Map<String, Integer> countersMap = new HashMap();
        for (Entity entity : queryResultList) {
            if(entity.hasProperty(propertyName)) {
                String propertyValue = (String) entity.getProperty(propertyName);
                Integer counter = countersMap.get(propertyValue);
                countersMap.put(propertyValue, (counter == null) ? 1 : counter + 1);
            }
        }
        return  countersMap;
    }

    private Map<String, Integer> getMostFrequent(Map<String, Integer> countersMap, int limit) {
        Map<String, Integer> result = countersMap.entrySet().stream()
                .sorted(Map.Entry.comparingByValue(Comparator.reverseOrder()))
                .limit(limit)
                .collect(Collectors.toMap(
                        Map.Entry::getKey, Map.Entry::getValue, (e1, e2) -> e1, LinkedHashMap::new));

        return result;
    }

    /**
     * TODO:
     * 1.
     * 2. Decide how to present the names of popular reporters (among the authennticated users - by checking the reporter's token. Problem: Users can choose nickname.)
     * 3.
     * */
}
