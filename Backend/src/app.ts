import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user.route';
import templateRoutes from './routes/template.route';
import authRoutes from './routes/auth.route';
import officeRoutes from './routes/office.route';
import notificationRoutes from './routes/notification.route';
import sectionRoutes from './routes/section.route';
import subjectRoutes from './routes/subject.route';
import workflowDefinitionRoutes from './routes/workflowDefinition.route';
import serviceRequestRoutes from './routes/serviceRequest.route';
import taskRoutes from './routes/task.route';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';
// import other domain routes as needed

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/offices', officeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/workflows', workflowDefinitionRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/tasks', taskRoutes);
// app.use('/api/other', otherRoutes);

export default app; 