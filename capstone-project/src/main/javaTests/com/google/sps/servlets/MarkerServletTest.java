package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.gson.Gson;
import com.google.sps.data.Marker;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.mockito.Mockito;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@RunWith(JUnit4.class)
public final class MarkerServletTest {

    private static final LocalServiceTestHelper helper =
            new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig());
    private static Marker marker;
    private static Entity markerEntity;
    private static HttpServletRequest request;
    private static HttpServletResponse response;
    private static MarkerServlet mockServlet;
    private static StringWriter stringWriter;
    private static PrintWriter writer;

    @Before
    public void setUp() throws IOException {
        helper.setUp();
        marker = new Marker.Builder()
                .setId(1111)
                .setLat(1)
                .setLng(1)
                .setAnimal("animal")
                .setReporter("reporter")
                .setDescription("description")
                .setUserId(Optional.empty())
                .setBlobKey("blobKey")
                .build();
        markerEntity = new Entity("Marker", 1111);
        markerEntity.setProperty("lat", 1.0);
        markerEntity.setProperty("lng", 1.0);
        markerEntity.setProperty("animal", "animal");
        markerEntity.setProperty("reporter", "reporter");
        markerEntity.setProperty("description", "description");
        markerEntity.setProperty("blobKey", "blobKey");
        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        mockServlet = mock(MarkerServlet.class);
        stringWriter = new StringWriter();
        writer = new PrintWriter(stringWriter);
        when(response.getWriter()).thenReturn(writer);
    }

    @After
    public void tearDown() {
        helper.tearDown();
    }

    @Test
    // Test the UPDATE case when the token ID is undefined
    public void doPostCaseUpdateTokenUndefined() throws IOException {
        Gson gson = new Gson();
        String markerJson = gson.toJson(marker);
        when(request.getParameter("marker")).thenReturn(markerJson);
        when(request.getParameter("action")).thenReturn("1");
        when(request.getParameter("userToken")).thenReturn("undefined");
        MockServletContext mockServletContext = new MockServletContext();

        MarkerServlet servlet = new MarkerServlet();
        MarkerServlet spiedServlet = Mockito.spy(servlet);
        Mockito.doReturn(mockServletContext).when(spiedServlet).getServletContext();
        spiedServlet.doPost(request, response);

        assertTrue(mockServletContext.throwable.toString().contains(new EntityNotFoundException(markerEntity.getKey()).toString()));
    }

    @Test
    // Test the doGet method when datastore is empty
    public void doGetDatastoreEmpty() throws IOException {
        new MarkerServlet().doGet(request, response);

        assertTrue(stringWriter.toString().equals("[]\n"));
    }

    @Test
    // Test the doGet method when datastore has marker
    public void doGetDatastoreNotEmpty() throws IOException {
        DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
        ds.put(markerEntity);

        Gson gson = new Gson();
        String json = gson.toJson(marker);

        new MarkerServlet().doGet(request, response);

        assertTrue(stringWriter.toString().contains(json));
    }

}