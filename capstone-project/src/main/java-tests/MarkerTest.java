import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.apphosting.api.DatastorePb;
import com.google.sps.data.Marker;
import org.junit.Before;
import org.junit.Test;
import  org.junit.jupiter.api.Assertions;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import com.google.appengine.api.datastore.Entity;
import static org.mockito.Mockito;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@RunWith(JUnit4.class)
public final class MarkerTest {
    private Marker marker;

    @Before
    public void setUp() {
        marker = new Marker.Builder()
                .setId(1111)
                .setLat(1)
                .setLng(1)
                .setAnimal("animal")
                .setReporter("reporter")
                .setDescription("description")
                .setUserId(Optional.of("userId"))
                .setBlobKey("blobKey")
                .build();
    }

    @Test
    public void createMarker() {
        assertTrue(marker != null);
    }

    @Test
    public void initializeMarker() {
        assertEquals(1111, marker.getId());
        assertEquals(1, marker.getLat());
        assertEquals(1, marker.getLng());
        assertEquals("animal", marker.getAnimal());
        assertEquals("reporter", marker.getReporter());
        assertEquals("description", marker.getDescription());
        assertEquals(Optional.of("userId"), marker.getUserId());
        assertEquals("blobKey", marker.getBlobKey());
    }

    @Test
    public void entityToMarker() {
        Entity entit = mock(Entity)
        Entity markerEntity = new Entity("Marker",1111);
        markerEntity.setProperty("lat", 1);
        markerEntity.setProperty("lng", 1);
        markerEntity.setProperty("animal", "animal");
        markerEntity.setProperty("reporter", "reporter");
        markerEntity.setProperty("description", "description");
        markerEntity.setProperty("blobKey", "blobKey");
        markerEntity.setProperty("userId", "userId");

    }
}