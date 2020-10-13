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

import com.google.appengine.api.blobstore.BlobstoreService;
import com.google.appengine.api.blobstore.BlobstoreServiceFactory;
import com.google.appengine.api.blobstore.BlobKey;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.sps.data.Marker;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import java.io.IOException;
import java.util.*;

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
        System.out.println("++++++++++++++++ Im here");
        int actionNum = Integer.parseInt(request.getParameter("action"));
        Action action = Action.values()[actionNum];
        Gson gson = new Gson();
        String blobKey;
        long markerId;
        switch (action) {
            case CREATE:
                Marker newMarker = gson.fromJson(request.getParameter("marker"), Marker.class);
                blobKey = getBlobKey(request);
                System.out.println("##########"+blobKey);
                newMarker.setBlobKey(blobKey);
                markerId = storeMarker(newMarker);
                // The ID of the entity need to be updated in the FE as well
                Map<String,String> responseMap = new HashMap<>();
                responseMap.put("id", Long.toString(markerId));
                responseMap.put("blobKey", blobKey);
                String responseJson = gson.toJson(responseMap);
                response.setContentType("application/json");
                response.getWriter().println(responseJson);
                break;
            case UPDATE:
                Marker updatedMarker = gson.fromJson(request.getParameter("marker"), Marker.class);
                blobKey = getBlobKey(request);
                updatedMarker.setBlobKey(blobKey);
                try {
                    updateMarker(updatedMarker);
                } catch (EntityNotFoundException e) {
                    response.getWriter().println("Update failed, Entity not found. Error details: " + e.toString());
                }
                response.getWriter().println(blobKey);
                break;
            case DELETE:
                markerId = Long.parseLong(request.getParameter("id"));
                deleteMarker(markerId);
        }
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

    /** Returns the BlobKey of an uploaded image so we can serve the blob. */
    private static String getBlobKey(HttpServletRequest request) {
        BlobstoreService blobstoreService = BlobstoreServiceFactory.getBlobstoreService();
        // Get all files uploaded to blobstore from this request
        System.out.println("**********" + request);
         Map<String, List<BlobKey>> blobs = blobstoreService.getUploads(request);
        System.out.println("**************" + blobs.toString());
        // Get the blobkey associated with the image uploaded
        List<BlobKey> blobKeys = blobs.get("image");
        String blobKey = "";
        // If a file was uploaded
        if(blobKeys != null && !blobKeys.isEmpty()) {
            blobKey = blobKeys.get(0).getKeyString();
        }

        return blobKey;
    }
}