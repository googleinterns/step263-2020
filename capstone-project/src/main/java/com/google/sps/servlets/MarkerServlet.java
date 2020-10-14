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
import com.google.appengine.repackaged.com.google.gson.JsonObject;
import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import com.google.sps.data.Marker;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;

// Enum describing which action should be performed.
enum Action {
    CREATE,
    UPDATE,
    DELETE
}

/** Handles fetching and saving markers data. */
@WebServlet("/markers")
public class MarkerServlet extends HttpServlet {

	/** Responds with a JSON array containing marker data. */
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");

        Collection<Marker> markers = getMarkers();
        Gson gson = new Gson();
        String json = gson.toJson(markers);

        response.getWriter().println(json);
    }

    /** Accepts a POST request containing a new marker. 
     * @throws IOException
     */
    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        int actionNum = Integer.parseInt(request.getParameter("action"));
        Action action = Action.values()[actionNum];
        String userToken = request.getParameter("userToken");
        Gson gson = new Gson();
        JsonElement markerJson = JsonParser.parseString(request.getParameter("marker"));
        long markerId;
        String userId = verifyToken(userToken);
        switch (action) {
            case CREATE:
                // Add userId to marker json
                markerJson.getAsJsonObject().addProperty("userId", userId);
                Marker newMarker = gson.fromJson(request.getParameter("marker"), Marker.class);
                markerId = storeMarker(newMarker);
                // The ID of the entity need to be updated in the FE as well
                response.getWriter().println(markerId);
                break;
            case UPDATE:
                Marker updatedMarker = gson.fromJson(request.getParameter("marker"), Marker.class);
                try {
                    updateMarker(updatedMarker);
                } catch (EntityNotFoundException e) {
                    response.getWriter().println("Update failed, Entity not found. Error details: " + e.toString());
                }
                break;
            case DELETE:
                markerId = Long.parseLong(request.getParameter("id"));
                deleteMarker(markerId);
        }
    }

    /** Verifies the idToken and returns the user ID */
    private static String verifyToken(String idTokenString) {
        JsonFactory jsonFactory = new JacksonFactory();
        HttpTransport transport = new NetHttpTransport();

        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport, jsonFactory)
        .setAudience(Collections.singletonList("client-id"))
        .build();
        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                Payload payload = idToken.getPayload();
                return payload.getSubject();
            }
        }
        catch(Exception exception) { }
        return "";
    }

    /** Fetches markers from Datastore. */
    private static Collection<Marker> getMarkers() {
        Collection<Marker> markers = new ArrayList<>();

        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        Query query = new Query("Marker");
        PreparedQuery results = datastore.prepare(query);

        for (Entity entity : results.asIterable()) {
            markers.add(Marker.fromEntity(entity));
        }
        return markers;
    }

    /** Stores a marker in Datastore and returns the ID. */
    private static long storeMarker(Marker marker) {
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        Entity markerEntity = Marker.toEntity(marker);
        datastore.put(markerEntity);
        return markerEntity.getKey().getId();
    }

    /** Updates an existing marker's data */
    private static void updateMarker(Marker marker) throws EntityNotFoundException {
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

        // Find the entity of the marker that needs to be updated using its ID
        Key markerEntityKey = KeyFactory.createKey("Marker", marker.getId());
        Entity markerEntity = datastore.get(markerEntityKey);
        // Overwrite the relevant entity with the updated data
        datastore.put(Marker.toEntity(marker, markerEntity));
    }

    /** Deletes a marker */
    private static void deleteMarker(long markersId) {
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        Key markerEntityKey = KeyFactory.createKey("Marker", markersId);
        datastore.delete(markerEntityKey);
    }
}