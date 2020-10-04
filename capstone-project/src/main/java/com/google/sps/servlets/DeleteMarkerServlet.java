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

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.gson.Gson;
import com.google.sps.data.Marker;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/** Handles deletion of existing markers. */
@WebServlet("/delete-marker")
public class DeleteMarkerServlet extends HttpServlet {

    /** Accepts a POST request containing a marker to delete.
     * @throws IOException
     */
    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Gson gson = new Gson();
        Marker marker = gson.fromJson(request.getReader().readLine(), Marker.class);
        deleteMarker(marker.getId());
    }

    public static void deleteMarker(long markersId) {
        Key markerEntityKey = KeyFactory.createKey("Marker", markersId);
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        datastore.delete(markerEntityKey);
    }
}
