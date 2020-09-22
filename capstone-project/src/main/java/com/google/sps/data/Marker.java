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

package com.google.sps.data;

/** Represents an animal report marker on the map. */
public class Marker {

    public static class Builder {

        private double lat;
        private double lng;
        private String animal;
        private String reporter;
        private String description;

        public Builder(){
        }

        public Builder setLat(double lat){
            this.lat = lat;
            return this;
        }

        public Builder setLng(double lng){
            this.lng = lng;
            return this;
        }

        public Builder setAnimal(String animal){
            this.animal = animal;
            return this;
        }

        public Builder setReporter(String reporter){
            this.reporter = reporter;
            return this;
        }

        public Builder setDescription(String description){
            this.description = description;
            return this;
        }

        public Marker build(){
            return new Marker(this);
        }
    }

    private final double lat;
    private final double lng;
    private final String animal;
    private final String reporter;
    private final String description;

    private Marker(Builder builder) {
        this.lat = builder.lat;
        this.lng = builder.lng;
        this.animal = builder.animal;
        this.reporter = builder.reporter;
        this.description = builder.description;
    }

    public double getLat() {
        return lat;
    }

    public double getLng() {
        return lng;
    }

    public String getAnimal() {
        return animal;
    }

    public String getReporter() {
        return reporter;
    }

    public String getDescription() {
        return description;
    }
}
